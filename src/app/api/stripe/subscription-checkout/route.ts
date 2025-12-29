import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Membership } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  try {
    const { membershipId } = await req.json();
    if (!membershipId) return NextResponse.json({ error: 'Missing membershipId' }, { status: 400 });

    const membership = await Membership.findById(parseInt(membershipId));
    
    if (!membership || !membership.IsActive) {
      return NextResponse.json({ error: 'Membership not found or inactive' }, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const monthlyPrice = parseFloat(membership.MonthlyPrice.toString());
    const membershipStartDate = membership.StartDate ? new Date(membership.StartDate) : null;
    const now = new Date();
    
    // Determinar si necesitamos un trial_end
    let trialEnd: number | undefined;
    
    if (membershipStartDate && now < membershipStartDate) {
      // Compra ANTES de la fecha de inicio: usar trial hasta esa fecha
      trialEnd = Math.floor(membershipStartDate.getTime() / 1000);
      console.log('🎯 Compra antes del inicio de membresía');
      console.log('   Fecha actual:', now.toISOString());
      console.log('   Inicio membresía:', membershipStartDate.toISOString());
      console.log('   Trial hasta:', new Date(trialEnd * 1000).toISOString());
      console.log('   Precio cuando termine trial: $' + monthlyPrice);
    } else {
      console.log('🎯 Compra después/sin fecha de inicio, cobra inmediatamente');
      console.log('   Precio: $' + monthlyPrice);
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: membership.Name,
              description: `Membresía mensual - ${membership.Description}`,
            },
            unit_amount: Math.round(monthlyPrice * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: { 
        membershipId: membership.Id.toString(),
        type: 'membership'
      },
      subscription_data: {
        ...(trialEnd ? { trial_end: trialEnd } : {}),
        metadata: {
          membershipId: membership.Id.toString(),
          ...(membershipStartDate ? { membershipStartDate: membershipStartDate.toISOString() } : {}),
        },
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Subscription checkout error:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la suscripción',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
