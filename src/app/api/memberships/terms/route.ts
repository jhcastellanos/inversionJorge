import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, membershipName } = await req.json();

    console.log('📨 Terms validation endpoint called:', {
      customerName,
      customerEmail,
      membershipName,
    });

    if (!customerName || !customerEmail) {
      console.error('❌ Missing required fields:', { customerName, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Just validate terms acceptance
    // PDF generation happens in the webhook after payment
    console.log('✅ Terms accepted, ready for Stripe checkout');
    
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
