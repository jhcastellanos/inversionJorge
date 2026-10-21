import Stripe from 'stripe';
import { Subscription } from './models';
import type { PlatformUserRow } from './platformUsers';
import { PlatformUser } from './platformUsers';
import { parsePlatformRole, type PlatformRole } from './platformRoles';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const ROLES_DOWNGRADE_WITHOUT_ACTIVE_SUB: PlatformRole[] = ['inversor', 'trader'];

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
 * Inversor/Trader sin suscripción activa → Estudiante (alumno). Admin y Soporte no se tocan.
 */
export async function syncPlatformRoleWithSubscription(
  user: PlatformUserRow,
  subscriptionActive: boolean
): Promise<PlatformUserRow> {
  const role = parsePlatformRole(user.platform_role);
  if (!role || role === 'admin' || role === 'soporte') {
    return user;
  }

  if (
    ROLES_DOWNGRADE_WITHOUT_ACTIVE_SUB.includes(role) &&
    !subscriptionActive &&
    user.platform_role !== 'alumno'
  ) {
    const updated = await PlatformUser.updatePlatformRole(user.id, 'alumno');
    return updated ?? { ...user, platform_role: 'alumno' };
  }

  return user;
}
