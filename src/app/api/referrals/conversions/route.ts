import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/auth';
import { ReferralConversion } from '../../../../lib/referrals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversions = await ReferralConversion.findAllWithTrader();
  return NextResponse.json({ conversions });
}
