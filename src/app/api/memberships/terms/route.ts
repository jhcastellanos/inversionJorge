import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, membershipName, stripeSubscriptionId } = await req.json();

    console.log('📨 Terms endpoint called:', {
      customerName,
      customerEmail,
      membershipName,
      stripeSubscriptionId,
      hasStripeId: !!stripeSubscriptionId,
    });

    if (!customerName || !customerEmail) {
      console.error('❌ Missing required fields:', { customerName, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // This endpoint is only for pre-payment validation (before Stripe)
    // Post-payment PDF generation is handled by the webhook via lib/terms.ts
    
    console.log('🎯 Pre-payment flow: Validating terms acceptance');
    return NextResponse.json({
      success: true,
      message: 'Terms accepted, proceed to payment',
    });
  } catch (error) {
    console.error('Error processing terms:', error);
    return NextResponse.json(
      {
        error: 'Error processing terms',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
