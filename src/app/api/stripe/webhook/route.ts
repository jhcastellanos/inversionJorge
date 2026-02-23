import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Customer, Order, Subscription, DiscordConnection, Contract } from '../../../../lib/models';
import { addRoleToMember, removeRoleFromMember, isGuildMember, sendDirectMessage } from '../../../../lib/discord';
import { processTermsAfterPayment } from '../../../../lib/terms';

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
    
    // Check if this is a subscription (has subscription field)
    if (session.subscription) {
      // Subscription checkout completed - no additional processing needed
      // The subscription is already active in Stripe
      console.log('✅ Subscription created:', session.subscription);
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
    }
  }

  // Handle invoice payment succeeded (creates subscription in database when first payment is processed)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    
    console.log('📋 Invoice received:', {
      invoiceId: invoice.id,
      subscription: invoice.subscription,
      metadata: invoice.metadata,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
    });
    
    // Only process if this is a subscription invoice with metadata
    if (invoice.subscription && invoice.metadata?.membershipId) {
      try {
        const membershipId = parseInt(invoice.metadata.membershipId);
        const customerId = invoice.customer as string;
        
        // Use invoice customer_email and customer_name as primary source
        // These are set by Stripe during checkout
        let email = invoice.customer_email || '';
        let name = invoice.customer_name || '';
        
        // Fallback to metadata if invoice doesn't have customer info
        if (!email && invoice.metadata?.customerEmail) {
          email = invoice.metadata.customerEmail;
        }
        if (!name && invoice.metadata?.customerName) {
          name = invoice.metadata.customerName;
        }
        
        if (!email) {
          console.error('❌ Missing customer email in invoice');
          return NextResponse.json({ received: true });
        }

        console.log(`📝 Processing invoice for: ${name} (${email})`);

        // Check if subscription already exists in database
        const existingSubscription = await Subscription.findByStripeId(invoice.subscription as string);
        
        if (!existingSubscription) {
          // Create new subscription in database
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
          
          // GENERATE AND SEND TERMS PDF AFTER PAYMENT
          // Only process if we have customer info
          if (name && email) {
            try {
              console.log(`📨 Starting terms processing for: ${name} (${email})`);
              await processTermsAfterPayment(invoice.subscription as string, name, email);
              console.log(`✅ Terms processing completed successfully`);
            } catch (termsError) {
              console.error('❌ Error processing terms:', termsError);
              // Don't fail the webhook on terms error
            }
          } else {
            console.warn(`⚠️ Missing name or email for terms processing. Name: ${name}, Email: ${email}`);
          }
        } else {
          console.log(`ℹ️ Subscription already exists in DB: ${invoice.subscription}`);
        }
      } catch (error) {
        console.error('❌ Error creating subscription from invoice:', error);
      }
    } else {
      console.log('ℹ️ Not a membership subscription, skipping invoice processing');
    }
  }

  // Handle subscription updates (status changes)
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      // Update subscription status in database
      await Subscription.updateStatus(subscription.id, subscription.status);
      
      console.log(`✅ Subscription ${subscription.id} status updated to: ${subscription.status}`);

      // Get subscription from database to get customer email
      const dbSubscription = await Subscription.findByStripeId(subscription.id);
      
      if (dbSubscription && dbSubscription.CustomerEmail) {
        // Check if user has Discord connected
        const discordConnection = await DiscordConnection.findByEmail(dbSubscription.CustomerEmail);
        
        if (discordConnection) {
          const guildId = process.env.DISCORD_GUILD_ID;
          const roleId = process.env.DISCORD_MEMBER_ROLE_ID;
          
          if (guildId && roleId) {
            // Check if user is in the server
            const isMember = await isGuildMember(guildId, discordConnection.DiscordUserId);
            
            if (isMember) {
              // Handle active subscription - add role
              if (subscription.status === 'active') {
                const roleAdded = await addRoleToMember(guildId, discordConnection.DiscordUserId, roleId);
                
                if (roleAdded) {
                  console.log(`✅ Discord role added for ${discordConnection.DiscordUsername}`);
                  
                  // Send welcome DM
                  await sendDirectMessage(
                    discordConnection.DiscordUserId,
                    `¡Bienvenido! Tu suscripción a ${dbSubscription.MembershipName} está activa. Ya tienes acceso al servidor de miembros.`
                  );
                } else {
                  console.error(`❌ Failed to add Discord role for ${discordConnection.DiscordUsername}`);
                }
              }
              
              // Handle cancelled/expired subscription - remove role
              if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
                const roleRemoved = await removeRoleFromMember(guildId, discordConnection.DiscordUserId, roleId);
                
                if (roleRemoved) {
                  console.log(`✅ Discord role removed for ${discordConnection.DiscordUsername}`);
                  
                  // Send cancellation DM
                  await sendDirectMessage(
                    discordConnection.DiscordUserId,
                    `Tu suscripción a ${dbSubscription.MembershipName} ha finalizado. Tu rol de miembro ha sido removido. Si deseas renovar, visita nuestro sitio web.`
                  );
                } else {
                  console.error(`❌ Failed to remove Discord role for ${discordConnection.DiscordUsername}`);
                }
              }
            } else {
              console.log(`⚠️ User ${discordConnection.DiscordUserId} is not a member of the guild`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling subscription update:', error);
    }
  }

  return NextResponse.json({ received: true });
}
