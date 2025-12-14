import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Customer, Purchase } from '../../../../lib/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });
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

    const customer = await Customer.upsert({ email, full_name: name });

    await Purchase.create({
      customer_id: customer.id,
      course_id: Number(courseId),
      purchase_code: session.id,
      amount_paid: session.amount_total! / 100,
      payment_method: 'stripe',
      payment_status: session.payment_status || 'completed'
    });
  }

  return NextResponse.json({ received: true });
}
