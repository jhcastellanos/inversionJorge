import Stripe from 'stripe';
import { Subscription } from './models';
import type { PlatformUserRow } from './platformUsers';
import {
  getPermissionsForRole,
  parsePlatformRole,
  getContentAccessForRole,
  type PlatformPermissions,
  type PlatformRole,
  type ContentAccess,
} from './platformRoles';

export type { ContentAccess };

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export type MemberAccessInfo = {
  hasAccess: boolean;
  subscriptions: Array<{
    membershipName: string;
    status: string;
    stripeSubscriptionId: string;
  }>;
  source: 'database' | 'stripe' | 'role' | 'none';
  role: PlatformRole | null;
  /** Rol usado para clases/eventos: asignado o Alumno si solo tiene Stripe */
  effectiveRole: PlatformRole | null;
  permissions: PlatformPermissions;
  contentAccess: ContentAccess;
};

async function getStripeSubscriptions(user: PlatformUserRow) {
  const emailSubs = await Subscription.findByEmail(user.email);
  if (emailSubs.length > 0) {
    return {
      hasStripeAccess: true,
      source: 'database' as const,
      subscriptions: emailSubs.map((s: any) => ({
        membershipName: s.MembershipName ?? 'Membresía',
        status: s.Status,
        stripeSubscriptionId: s.StripeSubscriptionId,
      })),
    };
  }

  if (user.stripe_customer_id && stripe) {
    try {
      const list = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 10,
      });
      if (list.data.length > 0) {
        return {
          hasStripeAccess: true,
          source: 'stripe' as const,
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
      console.warn('Stripe access check failed:', err);
    }
  }

  return { hasStripeAccess: false, source: 'none' as const, subscriptions: [] };
}

export async function getMemberAccess(user: PlatformUserRow): Promise<MemberAccessInfo> {
  const role = parsePlatformRole(user.platform_role);
  const permissions = getPermissionsForRole(role);
  const stripeInfo = await getStripeSubscriptions(user);

  const hasRoleAccess =
    role !== null && (permissions.alumno || permissions.admin || permissions.soporte);
  const hasAccess = stripeInfo.hasStripeAccess || hasRoleAccess;

  let source: MemberAccessInfo['source'] = 'none';
  if (stripeInfo.hasStripeAccess) source = stripeInfo.source;
  else if (hasRoleAccess) source = 'role';

  const effectiveRole: PlatformRole | null =
    role ?? (stripeInfo.hasStripeAccess ? 'alumno' : null);

  return {
    hasAccess,
    subscriptions: stripeInfo.subscriptions,
    source,
    role,
    effectiveRole,
    permissions,
    contentAccess: getContentAccessForRole(effectiveRole),
  };
}
