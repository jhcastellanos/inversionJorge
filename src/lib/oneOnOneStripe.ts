import Stripe from 'stripe';
import { getSiteBaseUrl } from './siteUrl';
import {
  ONE_ON_ONE_PRICE_CENTS,
  ONE_ON_ONE_PRICE_USD,
  ONE_ON_ONE_DURATION_MINUTES,
  OneOnOneRequest,
  canCompletePaymentNow,
} from './oneOnOneMeetings';
import { PlatformUser } from './platformUsers';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function createOneOnOneCheckoutSession(
  requestId: number,
  userId: number,
  host?: string | null,
  protocol?: string | null
): Promise<{ url: string }> {
  if (!stripe) throw new Error('Stripe no configurado');

  const request = await OneOnOneRequest.findById(requestId);
  if (!request || request.user_id !== userId) {
    throw new Error('Solicitud no encontrada');
  }
  if (!canCompletePaymentNow(request)) {
    throw new Error('El plazo para pagar esta solicitud ya venció o no está aprobada');
  }

  const user = await PlatformUser.findById(userId);
  const baseUrl = getSiteBaseUrl(host, protocol);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: user?.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Reunión 1-a-1 con la academia',
            description: `Sesión de ${ONE_ON_ONE_DURATION_MINUTES} minutos (USD ${ONE_ON_ONE_PRICE_USD})`,
          },
          unit_amount: ONE_ON_ONE_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      type: 'one_on_one',
      oneOnOneRequestId: String(requestId),
      platformUserId: String(userId),
    },
    success_url: `${baseUrl}/reunion-1a1?success=${requestId}`,
    cancel_url: `${baseUrl}/reunion-1a1?pay=${requestId}`,
  });

  if (!session.url) throw new Error('No se pudo crear la sesión de pago');

  await OneOnOneRequest.updateStatus(requestId, {
    stripe_checkout_session_id: session.id,
  });

  return { url: session.url };
}

export async function markOneOnOnePaidFromSession(session: Stripe.Checkout.Session): Promise<void> {
  const idRaw = session.metadata?.oneOnOneRequestId;
  if (!idRaw || session.metadata?.type !== 'one_on_one') return;

  const requestId = Number.parseInt(idRaw, 10);
  if (!Number.isFinite(requestId)) return;

  const request = await OneOnOneRequest.findById(requestId);
  if (!request || request.status === 'paid') return;

  await OneOnOneRequest.updateStatus(requestId, {
    status: 'paid',
    paid_at: new Date(),
    stripe_payment_intent_id:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  });

  const user = await PlatformUser.findById(request.user_id);
  if (user) {
    const { sendOneOnOnePaidConfirmation } = await import('./oneOnOneMeetingEmails');
    await sendOneOnOnePaidConfirmation(
      user.email,
      user.full_name,
      new Date(request.meeting_start_at).toISOString()
    );
  }
}