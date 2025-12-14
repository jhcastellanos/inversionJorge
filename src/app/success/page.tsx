import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { Customer, Order } from '../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/');
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const courseId = session.metadata?.courseId;
      const email = session.customer_details?.email;
      const name = session.customer_details?.name || '';

      if (courseId && email) {
        // Register the customer
        await Customer.upsert({ email, full_name: name });
        
        // Check if order already exists to avoid duplicates
        const existingOrder = await Order.findBySessionId(sessionId);
        
        if (!existingOrder) {
          await Order.create({
            user_id: email,
            course_id: Number(courseId),
            amount: session.amount_total! / 100,
            stripe_session_id: sessionId,
            stripe_payment_intent_id: session.payment_intent as string || null,
            payment_status: 'completed',
            payment_provider: 'stripe',
            customer_email: email,
            customer_name: name
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h1>
          <p className="text-gray-600">
            Gracias por tu compra. Recibirás las instrucciones de acceso al curso pronto en tu correo electrónico.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Volver a Cursos
          </a>
        </div>
      </div>
    </main>
  );
}
