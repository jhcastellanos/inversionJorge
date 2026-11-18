import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Customer, Order, Subscription, Membership } from '../../../../lib/models';
import { processTermsAfterPayment } from '../../../../lib/terms';
import { recordReferralConversionIfEligible } from '../../../../lib/referrals';
import { syncMemberEntitlementsByStripeCustomerId } from '../../../../lib/membershipEntitlementSync';
import { linkPlatformUserToStripeCustomerAndSync } from '../../../../lib/linkPlatformUserStripe';
import { sendMemberSubscriptionThankYouEmail } from '../../../../lib/memberEmails';
import { Course } from '../../../../lib/models';
import { grantAlumnoPackageFromPurchase, isAlumnoPackageCourseId } from '../../../../lib/memberAlumnoAccess';
import { PlatformUser } from '../../../../lib/platformUsers';
import { syncMemberEntitlementsByEmail } from '../../../../lib/membershipEntitlementSync';
import { markOneOnOnePaidFromSession } from '../../../../lib/oneOnOneStripe';
import { fulfillAlumnoPackageFromCheckoutSession } from '../../../../lib/alumnoPackageStripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log('🔔 WEBHOOK RECEIVED');
  console.log('🔔 Signature header:', req.headers.get('stripe-signature') ? 'Present' : 'Missing');
  
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    console.log('🔔 Verifying webhook signature...');
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, endpointSecret);
    console.log('🔔 Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle checkout session completed (one-time course purchases and subscriptions)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.type === 'one_on_one') {
      try {
        await markOneOnOnePaidFromSession(session);
        console.log('✅ One-on-one meeting payment recorded');
      } catch (err) {
        console.error('❌ One-on-one payment error:', err);
      }
    }

    if (session.metadata?.type === 'alumno_package') {
      try {
        await fulfillAlumnoPackageFromCheckoutSession(session);
        console.log('✅ Paquete cursos (estudiante 1 año) activado');
      } catch (err) {
        console.error('❌ alumno_package fulfillment error:', err);
      }
    }
    
    // Check if this is a subscription (has subscription field)
    if (session.mode === 'subscription' && session.subscription) {
      console.log('✅ Subscription checkout completed:', session.subscription);
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const email =
        session.metadata?.customerEmail?.trim() ||
        session.customer_details?.email?.trim() ||
        '';
      const platformUserId = session.metadata?.platformUserId
        ? Number.parseInt(session.metadata.platformUserId, 10)
        : undefined;

      if (customerId && email) {
        await linkPlatformUserToStripeCustomerAndSync(customerId, email, {
          platformUserId: Number.isFinite(platformUserId) ? platformUserId : undefined,
        });
      } else {
        console.warn('⚠️ Checkout subscription sin customer/email para vincular platform_user');
      }
    }
    
    // Handle one-time course purchases (no subscription)
    const courseId = session.metadata?.courseId;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || '';
    
    if (courseId && email) {
      await Customer.upsert({ email, full_name: name });

      await Order.create({
        user_id: email,
        course_id: Number(courseId),
        amount: session.amount_total! / 100,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string || null,
        payment_status: 'completed',
        payment_provider: 'stripe',
        customer_email: email,
        customer_name: name
      });

      const numericCourseId = Number(courseId);
      if (Number.isFinite(numericCourseId) && isAlumnoPackageCourseId(numericCourseId)) {
        try {
          const course = await Course.findById(numericCourseId);
          if (course) {
            const platformUser = await PlatformUser.findByEmail(email);
            if (platformUser) {
              await grantAlumnoPackageFromPurchase(platformUser.id, new Date());
              await syncMemberEntitlementsByEmail(email);
              console.log(`✅ Alumno package (legacy course) 1y for ${email}`);
            }
          }
        } catch (alumnoErr) {
          console.error('❌ Error granting alumno access from course:', alumnoErr);
        }
      }
    }
  }

  // Handle invoice payment succeeded (creates subscription in database when first payment is processed)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    
    console.log('📋 Invoice received:', {
      invoiceId: invoice.id,
      subscription: invoice.subscription,
      hasMembershipId: !!invoice.metadata?.membershipId,
    });
    
    if (invoice.subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const membershipIdRaw =
          invoice.metadata?.membershipId || stripeSubscription.metadata?.membershipId;
        if (!membershipIdRaw) {
          console.log('ℹ️ Invoice de suscripción sin membershipId, omitiendo');
        } else {
        const membershipId = parseInt(membershipIdRaw, 10);
        const customerId = invoice.customer as string;
        
        // Use invoice customer_email and customer_name as primary source
        // These are set by Stripe during checkout
        let email = invoice.customer_email || '';
        let name = invoice.customer_name || '';
        
        // Fallback to metadata if invoice doesn't have customer info
        if (!email && invoice.metadata?.customerEmail) {
          email = invoice.metadata.customerEmail;
        }
        if (!email && stripeSubscription.metadata?.customerEmail) {
          email = stripeSubscription.metadata.customerEmail;
        }
        if (!name && invoice.metadata?.customerName) {
          name = invoice.metadata.customerName;
        }
        if (!name && stripeSubscription.metadata?.customerName) {
          name = stripeSubscription.metadata.customerName;
        }
        
        if (!email) {
          console.error('❌ Missing customer email in invoice');
        } else {
        // Ensure the subscription exists in the database (it may have been
        // created already by the success page; create it here otherwise).
        const existingSubscription = await Subscription.findByStripeId(invoice.subscription as string);

        if (!existingSubscription) {
          await Subscription.create({
            membership_id: membershipId,
            customer_email: email,
            customer_name: name,
            stripe_subscription_id: invoice.subscription as string,
            stripe_customer_id: customerId,
            current_period_start: new Date(invoice.period_start * 1000),
            current_period_end: new Date(invoice.period_end * 1000)
          });
          console.log(`✅ Subscription created in DB: ${invoice.subscription}`);
        } else {
          console.log(`ℹ️ Subscription already exists in DB: ${invoice.subscription}`);
        }

        const referralCode =
          stripeSubscription.metadata?.referralCode ||
          invoice.metadata?.referralCode ||
          '';

        const membership = await Membership.findById(membershipId);
        const membershipName = membership?.Name || `Membresía #${membershipId}`;

        const amountPaid = invoice.amount_paid ?? 0;
        if (referralCode && email && amountPaid > 0) {
          try {
            const conversion = await recordReferralConversionIfEligible({
              referralCode,
              referredEmail: email,
              referredName: name,
              membershipType: membershipName,
              stripeSubscriptionId: invoice.subscription as string,
              completedAt: new Date(),
            });
            if (conversion) {
              console.log(`✅ Referral conversion recorded: ${conversion.id}`);
            }
          } catch (referralError) {
            console.error('❌ Error recording referral conversion:', referralError);
          }
        } else if (referralCode && amountPaid <= 0) {
          console.log('ℹ️ Skipping referral: invoice has no payment yet');
        }

        // Generate, email and store the contract AFTER payment.
        // processTermsAfterPayment is idempotent, so this runs exactly once
        // per subscription regardless of how many times the webhook fires.
        if (name && email) {
          try {
            await processTermsAfterPayment(invoice.subscription as string, name, email);
          } catch (termsError) {
            console.error('❌ Error processing terms:', termsError);
            // Don't fail the webhook on terms error
          }

          if (!existingSubscription && amountPaid > 0) {
            void sendMemberSubscriptionThankYouEmail(email, name, membershipName).catch((err) =>
              console.error('Subscription thank-you email error:', err)
            );
          }
        } else {
          console.warn(`⚠️ Missing name or email for terms processing on subscription ${invoice.subscription}`);
        }

        const platformUserId = stripeSubscription.metadata?.platformUserId
          ? Number.parseInt(stripeSubscription.metadata.platformUserId, 10)
          : undefined;
        await linkPlatformUserToStripeCustomerAndSync(customerId, email, {
          platformUserId: Number.isFinite(platformUserId) ? platformUserId : undefined,
        });
        }
        }
      } catch (error) {
        console.error('❌ Error creating subscription from invoice:', error);
      }
    }
  }

  // Handle subscription updates (status changes)
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      await Subscription.updateStatus(
        subscription.id,
        subscription.status,
        Boolean(subscription.cancel_at_period_end)
      );

      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      await syncMemberEntitlementsByStripeCustomerId(customerId);
      console.log(
        `✅ Subscription ${subscription.id} → ${subscription.status}; entitlements synced for ${customerId}`
      );
    } catch (error) {
      console.error('Error handling subscription update:', error);
    }
  }

  return NextResponse.json({ received: true });
}
