import Stripe from 'stripe';
import { getSiteBaseUrl } from './siteUrl';
import {
  getAlumnoPackageStripePriceId,
  isAlumnoPackageCheckoutEnabled,
  ALUMNO_PACKAGE_DEFAULT_TITLE,
} from './alumnoPackageConfig';
import { PlatformUser } from './platformUsers';
import { addAlumnoAccessYears, grantAlumnoPackageFromPurchase } from './memberAlumnoAccess';
import { syncMemberEntitlementsForUser } from './membershipEntitlementSync';
import { linkPlatformUserToStripeCustomerAndSync } from './linkPlatformUserStripe';
import { recordAlumnoPackagePurchaseIfNew } from './alumnoPackagePurchases';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function createAlumnoPackageCheckoutSession(
  userId: number,
  host?: string | null,
  protocol?: string | null
): Promise<{ url: string }> {
  if (!stripe || !isAlumnoPackageCheckoutEnabled()) {
    throw new Error('Paquete cursos no configurado en Stripe');
  }

  const priceId = getAlumnoPackageStripePriceId()!;
  const user = await PlatformUser.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  const baseUrl = getSiteBaseUrl(host, protocol);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      type: 'alumno_package',
      platformUserId: String(userId),
      productTitle: ALUMNO_PACKAGE_DEFAULT_TITLE,
    },
    success_url: `${baseUrl}/planes?alumno_package=success`,
    cancel_url: `${baseUrl}/planes?alumno_package=cancel`,
  });

  if (!session.url) throw new Error('No se pudo crear la sesión de pago');
  return { url: session.url };
}

export async function fulfillAlumnoPackageFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.metadata?.type !== 'alumno_package') return;
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    console.log('ℹ️ alumno_package session not paid yet, skipping');
    return;
  }

  const userIdRaw = session.metadata?.platformUserId;
  const userId = userIdRaw ? Number.parseInt(userIdRaw, 10) : NaN;
  if (!Number.isFinite(userId)) {
    const email =
      session.customer_details?.email?.trim() ||
      session.customer_email?.trim() ||
      '';
    if (!email) {
      console.warn('alumno_package: sin userId ni email');
      return;
    }
    const user = await PlatformUser.findByEmail(email);
    if (!user) {
      console.warn('alumno_package: usuario no encontrado', email);
      return;
    }
    await fulfillForUser(user.id, session);
    return;
  }

  await fulfillForUser(userId, session);
}

async function fulfillForUser(userId: number, session: Stripe.Checkout.Session): Promise<void> {
  const purchasedAt = session.created ? new Date(session.created * 1000) : new Date();
  const accessUntil = addAlumnoAccessYears(purchasedAt);

  const inserted = await recordAlumnoPackagePurchaseIfNew({
    userId,
    stripeCheckoutSessionId: session.id,
    purchasedAt,
    accessUntil,
  });

  if (!inserted) {
    console.log(`ℹ️ alumno_package ya procesado: ${session.id}`);
    return;
  }

  await grantAlumnoPackageFromPurchase(userId, purchasedAt);

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const email = session.customer_details?.email?.trim() || session.customer_email?.trim() || '';

  if (customerId && email) {
    await linkPlatformUserToStripeCustomerAndSync(customerId, email, { platformUserId: userId });
  }

  await syncMemberEntitlementsForUser(userId);
  console.log(`✅ Paquete cursos activado hasta ${accessUntil.toISOString()} para user ${userId}`);
}