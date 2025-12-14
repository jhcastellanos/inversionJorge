import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Customer, Order } from '../../../../lib/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseId = session.metadata?.courseId;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || '';
    if (!courseId || !email) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    await Customer.upsert({ email, full_name: name });

    await Order.create({
      user_id: email,
      course_id: Number(courseId),
      amount: session.amount_total! / 100,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string || null,
      payment_status: 'completed',
      payment_provider: 'stripe',
      customer_email: email,
      customer_name: name
    });
  }

  return NextResponse.json({ received: true });
}
