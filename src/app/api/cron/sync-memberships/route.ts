import { NextRequest, NextResponse } from 'next/server';
import {
  syncAllPlatformMemberEntitlements,
  syncAllStripeLinkedMembers,
} from '../../../../lib/membershipEntitlementSync';
import {
  getMiamiHourMinute,
  isMiamiDailyMembershipAuditTime,
} from '../../../../lib/membershipCronSchedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get('force') === '1';
  const scope = req.nextUrl.searchParams.get('scope');

  if (!force && !isMiamiDailyMembershipAuditTime()) {
    const miami = getMiamiHourMinute();
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'Fuera de la ventana diaria (19:00 America/New_York)',
      miamiNow: `${miami.hour}:${String(miami.minute).padStart(2, '0')}`,
    });
  }

  const fullNightly = scope === 'full' || force || isMiamiDailyMembershipAuditTime();

  const results = fullNightly
    ? await syncAllPlatformMemberEntitlements({ enforceInactiveWithoutStripe: true })
    : await syncAllStripeLinkedMembers();

  const changed = results.filter((r) => r.changed);
  const downgraded = results.filter(
    (r) => r.changed && r.newRole === 'visitante' && !r.subscriptionActive
  );

  return NextResponse.json({
    ok: true,
    mode: fullNightly ? 'full_platform' : 'stripe_discord_linked',
    total: results.length,
    changed: changed.length,
    downgraded: downgraded.length,
    results: results.map((r) => ({
      email: r.email,
      subscriptionActive: r.subscriptionActive,
      previousRole: r.previousRole,
      newRole: r.newRole,
      changed: r.changed,
      skipped: r.skipped,
      discord: r.discord,
    })),
  });
}