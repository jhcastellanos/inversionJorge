import { PlatformUser, type PlatformUserRow } from './platformUsers';
import { ensurePlatformUserDiscordSchema } from './platformUserDiscordSchema';
import { syncMemberEntitlementsForUser } from './membershipEntitlementSync';

export async function linkPlatformUserToStripeCustomer(
  stripeCustomerId: string,
  email: string,
  options?: { platformUserId?: number }
): Promise<PlatformUserRow | null> {
  if (!stripeCustomerId?.startsWith('cus_')) return null;
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return null;

  await ensurePlatformUserDiscordSchema();

  let user: PlatformUserRow | null = null;
  if (options?.platformUserId) {
    user = await PlatformUser.findById(options.platformUserId);
    if (user && user.email.toLowerCase() !== normalizedEmail) {
      user = await PlatformUser.findByEmail(normalizedEmail);
    }
  } else {
    user = await PlatformUser.findByEmail(normalizedEmail);
  }

  if (!user) {
    console.warn(`linkPlatformUserToStripeCustomer: no platform user for ${normalizedEmail}`);
    return null;
  }

  if (user.stripe_customer_id && user.stripe_customer_id !== stripeCustomerId) {
    console.warn(
      `linkPlatformUserToStripeCustomer: updating stripe id for user ${user.id} (${user.stripe_customer_id} → ${stripeCustomerId})`
    );
  }

  const linked =
    user.stripe_customer_id === stripeCustomerId
      ? user
      : await PlatformUser.linkStripeCustomer(user.id, stripeCustomerId);

  return linked;
}

export async function linkPlatformUserToStripeCustomerAndSync(
  stripeCustomerId: string,
  email: string,
  options?: { platformUserId?: number }
) {
  const user = await linkPlatformUserToStripeCustomer(stripeCustomerId, email, options);
  if (!user) return null;
  await syncMemberEntitlementsForUser(user.id).catch((e) => {
    console.warn('Entitlement sync after Stripe link:', e);
  });
  return user;
}