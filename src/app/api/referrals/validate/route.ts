import { NextRequest, NextResponse } from 'next/server';
import { ReferralTrader } from '../../../../lib/referrals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code?.trim()) {
    return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 });
  }

  const trader = await ReferralTrader.findByCode(code);
  if (!trader) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    code: trader.referral_code,
    alias: trader.alias,
  });
}
