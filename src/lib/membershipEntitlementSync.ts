import Stripe from 'stripe';
import { syncDiscordTraderRole } from './discordGuild';
import { Subscription } from './models';
import { getActiveSubscriptionInfo } from './memberSubscriptionSync';
import {
  MEMBERSHIP_ACTIVE_PLATFORM_ROLE,
  MEMBERSHIP_INACTIVE_PLATFORM_ROLE,
  isPlatformStaffRole,
  parsePlatformRole,
  type PlatformRole,
} from './platformRoles';
import { PlatformUser, type PlatformUserRow } from './platformUsers';
import { ensurePlatformUserDiscordSchema } from './platformUserDiscordSchema';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export type EntitlementSyncResult = {
  userId: number;
  email: string;
  subscriptionActive: boolean;
  previousRole: string | null;
  newRole: string | null;
  discord?: { ok: boolean; action?: string; reason?: string; skipped?: boolean };
  changed: boolean;
  skipped?: string;
};

function roleManagedByStripeMembership(role: PlatformRole | null): boolean {
  if (!role) return true;
  if (isPlatformStaffRole(role)) return false;
  return role === 'trader' || role === 'inversor' || role === 'visitante' || role === 'alumno';
}

export async function isStripeMembershipActiveForUser(user: PlatformUserRow): Promise<boolean> {
  if (!user.stripe_customer_id) return false;
  const info = await getActiveSubscriptionInfo(user);
  if (info.active) return true;

  if (!stripe) return false;

  try {
    const list = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 20,
    });
    const now = Math.floor(Date.now() / 1000);
    return list.data.some((sub) => {
      if (sub.status === 'active' || sub.status === 'trialing') return true;
      if (sub.status === 'canceled' && sub.current_period_end > now) return true;
      return false;
    });
  } catch {
    return false;
  }
}

type SyncMemberOptions = {
  /** Auditoría nocturna: sin Stripe activo → visitante aunque no tengan Discord vinculado. */
  enforceInactiveWithoutStripe?: boolean;
};

export async function syncMemberEntitlementsForUser(
  userId: number,
  options?: SyncMemberOptions
): Promise<EntitlementSyncResult | null> {
  await ensurePlatformUserDiscordSchema();
  const user = await PlatformUser.findById(userId);
  if (!user) return null;

  const role = parsePlatformRole(user.platform_role);
  if (!roleManagedByStripeMembership(role)) {
    return {
      userId: user.id,
      email: user.email,
      subscriptionActive: false,
      previousRole: user.platform_role,
      newRole: user.platform_role,
      changed: false,
      skipped: 'Rol manual (admin/soporte)',
    };
  }

  if (!user.stripe_customer_id && !user.discord_user_id && !options?.enforceInactiveWithoutStripe) {
    return {
      userId: user.id,
      email: user.email,
      subscriptionActive: false,
      previousRole: user.platform_role,
      newRole: user.platform_role,
      changed: false,
      skipped: 'Sin Stripe ni Discord vinculado',
    };
  }

  const subscriptionActive = user.stripe_customer_id
    ? await isStripeMembershipActiveForUser(user)
    : false;

  const targetRole: PlatformRole = subscriptionActive
    ? MEMBERSHIP_ACTIVE_PLATFORM_ROLE
    : MEMBERSHIP_INACTIVE_PLATFORM_ROLE;

  let currentUser = user;
  let changed = false;
  if (user.platform_role !== targetRole) {
    const updated = await PlatformUser.updatePlatformRole(user.id, targetRole);
    if (updated) {
      currentUser = updated;
      changed = true;
    }
  }

  let discordResult;
  const discordUserId = currentUser.discord_user_id ?? user.discord_user_id;
  if (discordUserId) {
    discordResult = await syncDiscordTraderRole(discordUserId, subscriptionActive);
  }

  return {
    userId: currentUser.id,
    email: currentUser.email,
    subscriptionActive,
    previousRole: user.platform_role,
    newRole: currentUser.platform_role,
    discord: discordResult,
    changed,
  };
}

export async function syncMemberEntitlementsByEmail(email: string) {
  const user = await PlatformUser.findByEmail(email);
  if (!user) return null;
  return syncMemberEntitlementsForUser(user.id);
}

export async function syncMemberEntitlementsByStripeCustomerId(stripeCustomerId: string) {
  await ensurePlatformUserDiscordSchema();
  const { pool } = await import('./db');
  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT id FROM platform_users WHERE stripe_customer_id = $1 LIMIT 1`,
      [stripeCustomerId]
    );
    const id = r.rows[0]?.id;
    if (!id) {
      const subs = await Subscription.findActiveByStripeCustomerId(stripeCustomerId);
      const email = (subs[0] as { customeremail?: string; CustomerEmail?: string } | undefined)
        ?.CustomerEmail ?? (subs[0] as { customeremail?: string })?.customeremail;
      if (email) {
        const u = await PlatformUser.findByEmail(email);
        if (u) {
          if (!u.stripe_customer_id) {
            await PlatformUser.linkStripeCustomer(u.id, stripeCustomerId);
          }
          return syncMemberEntitlementsForUser(u.id);
        }
      }
      return null;
    }
    return syncMemberEntitlementsForUser(Number(id));
  } finally {
    client.release();
  }
}

export async function syncAllStripeLinkedMembers() {
  await ensurePlatformUserDiscordSchema();
  const users = await PlatformUser.listForMembershipSync();
  const results: EntitlementSyncResult[] = [];
  for (const u of users) {
    const r = await syncMemberEntitlementsForUser(u.id);
    if (r) results.push(r);
  }
  return results;
}

/** Recorre todos los usuarios de plataforma (admin/soporte no se modifican). */
export async function syncAllPlatformMemberEntitlements(options?: SyncMemberOptions) {
  await ensurePlatformUserDiscordSchema();
  const users = await PlatformUser.findAll();
  const results: EntitlementSyncResult[] = [];
  for (const u of users) {
    const r = await syncMemberEntitlementsForUser(u.id, options);
    if (r) results.push(r);
  }
  return results;
}