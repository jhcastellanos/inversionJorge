import { NextRequest, NextResponse } from 'next/server';
import { generateTermsPDF, sendTermsEmail } from '@/lib/terms';

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

    // Generate PDF with terms
    console.log('📄 Generating PDF...');
    const pdfBuffer = await generateTermsPDF(
      customerName,
      customerEmail,
      new Date()
    );

    // Send email with PDF attachment
    console.log('📧 Sending email with PDF...');
    await sendTermsEmail(
      customerName,
      customerEmail,
      pdfBuffer
    );

    console.log('✅ Terms processed successfully, PDF generated and email sent');
    
    return NextResponse.json({
      success: true,
      message: 'Terms accepted and PDF sent to email. Proceed to payment.',
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
