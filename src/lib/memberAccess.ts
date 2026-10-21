import Stripe from 'stripe';
import { Subscription } from './models';
import type { PlatformUserRow } from './platformUsers';

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
  source: 'database' | 'stripe' | 'none';
};

export async function getMemberAccess(user: PlatformUserRow): Promise<MemberAccessInfo> {
  const emailSubs = await Subscription.findByEmail(user.email);
  if (emailSubs.length > 0) {
    return {
      hasAccess: true,
      source: 'database',
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
          hasAccess: true,
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
      console.warn('Stripe access check failed:', err);
    }
  }

  return { hasAccess: false, source: 'none', subscriptions: [] };
}
