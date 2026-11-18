import Stripe from 'stripe';
import { Subscription } from './models';
import type { PlatformUserRow } from './platformUsers';
import { PlatformUser } from './platformUsers';
import { parsePlatformRole, type PlatformRole, isPlatformStaffRole } from './platformRoles';
import { resolveAutomatedMembershipRole } from './resolveMemberPlatformRole';
import { userHasActiveAlumnoAccess } from './memberAlumnoAccess';
import { ensurePlatformUserAlumnoSchema } from './platformUserAlumnoSchema';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const ROLES_DOWNGRADE_WITHOUT_ACTIVE_SUB: PlatformRole[] = ['inversor', 'trader', 'trader_alumno'];

export type ActiveSubscriptionInfo = {
  active: boolean;
  subscriptions: Array<{
    membershipName: string;
    status: string;
    stripeSubscriptionId: string;
  }>;
  source: 'database' | 'stripe' | 'none';
};

export async function getActiveSubscriptionInfo(
  user: PlatformUserRow
): Promise<ActiveSubscriptionInfo> {
  if (!user.stripe_customer_id) {
    return { active: false, subscriptions: [], source: 'none' };
  }

  const dbSubs = await Subscription.findActiveByStripeCustomerId(user.stripe_customer_id);
  if (dbSubs.length > 0) {
    return {
      active: true,
      source: 'database',
      subscriptions: dbSubs.map((s: { MembershipName?: string; Status: string; StripeSubscriptionId: string }) => ({
        membershipName: s.MembershipName ?? 'Membresía',
        status: s.Status,
        stripeSubscriptionId: s.StripeSubscriptionId,
      })),
    };
  }

  if (stripe) {
    try {
      const list = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 10,
      });
      if (list.data.length > 0) {
        return {
          active: true,
          source: 'stripe',
          subscriptions: list.data.map((sub) => ({
            membershipName: sub.metadata?.membershipId
              ? `Membresía #${sub.metadata.membershipId}`
              : 'Membresía activa',
            status: sub.status,
            stripeSubscriptionId: sub.id,
          })),
        };
      }
    } catch (err) {
      console.warn('Stripe subscription check failed:', err);
    }
  }

  return { active: false, subscriptions: [], source: 'none' };
}

/**
 * Usuarios con Stripe: sin suscripción activa → visitante (sin CRM).
 * Sin Stripe: inversor/trader sin sub → alumno (comportamiento anterior).
 * Admin y soporte no se tocan.
 */
export async function syncPlatformRoleWithSubscription(
  user: PlatformUserRow,
  subscriptionActive: boolean
): Promise<PlatformUserRow> {
  await ensurePlatformUserAlumnoSchema();
  const role = parsePlatformRole(user.platform_role);
  if (!role || isPlatformStaffRole(role)) {
    return user;
  }

  const alumnoAccessActive = userHasActiveAlumnoAccess(user);
  const targetRole = resolveAutomatedMembershipRole(subscriptionActive, alumnoAccessActive);

  if (user.stripe_customer_id || alumnoAccessActive) {
    if (user.platform_role !== targetRole) {
      const updated = await PlatformUser.updatePlatformRole(user.id, targetRole);
      return updated ?? { ...user, platform_role: targetRole };
    }
    return user;
  }

  if (
    ROLES_DOWNGRADE_WITHOUT_ACTIVE_SUB.includes(role) &&
    !subscriptionActive &&
    !alumnoAccessActive &&
    user.platform_role !== targetRole
  ) {
    const updated = await PlatformUser.updatePlatformRole(user.id, targetRole);
    return updated ?? { ...user, platform_role: targetRole };
  }

  return user;
}
