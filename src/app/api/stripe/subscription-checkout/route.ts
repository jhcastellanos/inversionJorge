import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Membership } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  try {
    const { membershipId, customerName, customerEmail } = await req.json();
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
      // Calcular días hasta la fecha de inicio
      const daysUntilStart = (membershipStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Stripe requiere al menos 2 días para trial_end
      // Si faltan menos de 2 días, cobramos inmediatamente (bypass)
      if (daysUntilStart >= 2) {
        // Compra ANTES de la fecha de inicio: usar trial hasta esa fecha
        trialEnd = Math.floor(membershipStartDate.getTime() / 1000);
        console.log('🎯 Compra antes del inicio de membresía (con trial)');
        console.log('   Fecha actual:', now.toISOString());
        console.log('   Inicio membresía:', membershipStartDate.toISOString());
        console.log('   Días hasta inicio:', daysUntilStart.toFixed(2));
        console.log('   Trial hasta:', new Date(trialEnd * 1000).toISOString());
        console.log('   Precio cuando termine trial: $' + monthlyPrice);
      } else {
        // Fecha de inicio muy próxima: hacer bypass y cobrar inmediatamente
        console.log('🎯 Compra antes del inicio PERO fecha muy próxima (< 2 días, bypass)');
        console.log('   Fecha actual:', now.toISOString());
        console.log('   Inicio membresía:', membershipStartDate.toISOString());
        console.log('   Días hasta inicio:', daysUntilStart.toFixed(2));
        console.log('   Cobrando inmediatamente: $' + monthlyPrice);
      }
    } else {
      console.log('🎯 Compra después/sin fecha de inicio, cobra inmediatamente');
      console.log('   Precio: $' + monthlyPrice);
    }

    // Validate price
    if (monthlyPrice <= 0) {
      return NextResponse.json({ 
        error: 'Invalid membership price',
        details: `Price must be greater than 0, got: ${monthlyPrice}`
      }, { status: 400 });
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
        type: 'membership',
        customerName: customerName || '',
        customerEmail: customerEmail || '',
      },
      subscription_data: {
        ...(trialEnd ? { trial_end: trialEnd } : {}),
        metadata: {
          membershipId: membership.Id.toString(),
          type: 'membership',
          customerName: customerName || '',
          customerEmail: customerEmail || '',
          ...(membershipStartDate ? { membershipStartDate: membershipStartDate.toISOString() } : {}),
        },
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    });

    if (!session.url) {
      throw new Error('Failed to generate checkout session URL');
    }

    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      membershipId: membership.Id,
      price: monthlyPrice,
      hasTrialEnd: !!trialEnd,
      customerName,
      customerEmail,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Subscription checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Stripe.errors.StripeError ? error.code : undefined;
    
    return NextResponse.json({ 
      error: 'Error al procesar la suscripción',
      details: errorMessage,
      code: errorDetails
    }, { status: 500 });
  }
}
