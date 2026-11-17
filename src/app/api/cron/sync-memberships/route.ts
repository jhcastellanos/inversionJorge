import { NextRequest, NextResponse } from 'next/server';
import {
  syncAllPlatformMemberEntitlements,
  syncAllStripeLinkedMembers,
} from '../../../../lib/membershipEntitlementSync';

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

  const scope = req.nextUrl.searchParams.get('scope');
  const fullPlatform =
    scope !== 'linked';

  const results = fullPlatform
    ? await syncAllPlatformMemberEntitlements({ enforceInactiveWithoutStripe: true })
    : await syncAllStripeLinkedMembers();

  const changed = results.filter((r) => r.changed);
  const downgraded = results.filter(
    (r) => r.changed && r.newRole === 'visitante' && !r.subscriptionActive
  );

  return NextResponse.json({
    ok: true,
    mode: fullPlatform ? 'full_platform' : 'stripe_discord_linked',
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