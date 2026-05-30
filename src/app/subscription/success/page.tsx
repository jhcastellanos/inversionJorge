import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { Subscription, Membership } from '../../../lib/models';
import { processTermsAfterPayment } from '../../../lib/terms';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SubscriptionSuccessPage({
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
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('🔍 Session retrieved:', {
      id: session.id,
      subscription: session.subscription,
      membershipId: session.metadata?.membershipId
    });
    
    if (!session.subscription) {
      console.error('❌ No subscription found in session');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p>No se encontró la suscripción</p>
          </div>
        </div>
      );
    }

    // Get subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const membershipId = parseInt(session.metadata?.membershipId || '0');
    
    console.log('📦 Stripe subscription:', {
      id: stripeSubscription.id,
      customer: stripeSubscription.customer,
      status: stripeSubscription.status
    });
    
    if (!membershipId) {
      console.error('❌ No membershipId found');
      return <div>Error: membershipId no encontrado</div>;
    }

    const membership = await Membership.findById(membershipId);
    console.log('✅ Membership found:', membership?.Name);

    // Resolve customer identity (form values in metadata take precedence)
    const customerEmail = session.metadata?.customerEmail || session.customer_details?.email || '';
    const customerName = session.metadata?.customerName || session.customer_details?.name || '';

    // Check if subscription already exists
    const existing = await Subscription.findByStripeId(stripeSubscription.id);
    
    if (!existing) {
      console.log('💾 Creating new subscription in database...');
      const newSub = await Subscription.create({
        membership_id: membershipId,
        customer_email: customerEmail,
        customer_name: customerName,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer as string,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      });
      console.log('✅ Subscription created in DB (id:', newSub?.Id, ')');
    } else {
      console.log('ℹ️ Subscription already exists:', existing.Id);
    }

    // Generate, email and store the contract after payment. This is idempotent
    // (skips if a contract already exists), so it works whether or not a Stripe
    // webhook is configured, and never duplicates if both paths run.
    if (customerName && customerEmail) {
      try {
        await processTermsAfterPayment(stripeSubscription.id, customerName, customerEmail);
      } catch (termsError) {
        console.error('❌ Error processing terms on success page:', termsError);
      }
    }

    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              ¡Suscripción Activada!
            </h1>
            
            <p className="text-center text-gray-600 mb-8">
              Tu suscripción a <span className="font-semibold text-indigo-600">{membership?.Name}</span> ha sido activada exitosamente
            </p>

            {/* Subscription Details */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Detalles de tu suscripción
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Membresía:</span>
                  <span className="font-semibold text-gray-900">{membership?.Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-semibold text-gray-900">${membership?.MonthlyPrice}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Próximo cobro:</span>
                  <span className="font-semibold text-gray-900">
                    {periodEnd.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Activa
                  </span>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">Información importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• El cobro se realizará automáticamente cada mes en la misma fecha</li>
                    <li>• Puedes cancelar tu suscripción en cualquier momento</li>
                    <li>• Los pagos ya procesados no son reembolsables</li>
                    <li>• Mantendrás acceso hasta el final de tu período pagado actual</li>
                    <li>• Recibirás un correo de confirmación con todos los detalles</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/" 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-center hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Volver al inicio
              </Link>
              <Link 
                href={`/subscription/manage?email=${session.customer_details?.email}`}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-all"
              >
                Gestionar suscripción
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p>No se pudo verificar la suscripción</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }
}
