import { NextRequest, NextResponse } from 'next/server';
import { syncAllStripeLinkedMembers } from '../../../../lib/membershipEntitlementSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await syncAllStripeLinkedMembers();
  const changed = results.filter((r) => r.changed);
  return NextResponse.json({
    ok: true,
    total: results.length,
    changed: changed.length,
    results: results.map((r) => ({
      email: r.email,
      subscriptionActive: r.subscriptionActive,
      newRole: r.newRole,
      changed: r.changed,
      discord: r.discord,
    })),
  });
}