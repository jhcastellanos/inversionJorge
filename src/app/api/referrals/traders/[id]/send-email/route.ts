import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../../../lib/auth';
import { ReferralTrader } from '../../../../../../lib/referrals';
import { sendReferralProgramEmail } from '../../../../../../lib/referralEmail';
import { buildReferralLink } from '../../../../../../lib/siteUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const traderId = parseInt(id, 10);
  if (!Number.isFinite(traderId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const trader = await ReferralTrader.findById(traderId);
    if (!trader) {
      return NextResponse.json({ error: 'Referidor no encontrado' }, { status: 404 });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto');
    const referralLink = buildReferralLink(trader.referral_code, host, protocol);

    const result = await sendReferralProgramEmail(trader.email, trader.alias, referralLink);

    return NextResponse.json({
      success: true,
      emailId: result.id,
      sentTo: trader.email,
    });
  } catch (error) {
    console.error('Error sending referral email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al enviar el email' },
      { status: 500 }
    );
  }
}
