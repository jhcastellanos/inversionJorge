import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Subscription } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  try {
    const { stripeSubscriptionId } = await req.json();

    console.log('🚫 Canceling subscription:', stripeSubscriptionId);

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'Stripe subscription ID is required' }, { status: 400 });
    }

    // Cancel subscription at period end (no refund)
    const canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('✅ Stripe subscription updated:', {
      id: canceledSubscription.id,
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      status: canceledSubscription.status,
      current_period_end: new Date(canceledSubscription.current_period_end * 1000)
    });

    // Update database
    await Subscription.updateStatus(stripeSubscriptionId, 'active', true);
    console.log('💾 Database updated for subscription:', stripeSubscriptionId);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription will be canceled at the end of the current period',
      periodEnd: new Date(canceledSubscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    return NextResponse.json({ 
      error: 'Error canceling subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
