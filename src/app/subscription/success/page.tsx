import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { Subscription, Membership } from '../../../lib/models';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

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
      email: session.customer_details?.email,
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

    // Check if subscription already exists
    const existing = await Subscription.findByStripeId(stripeSubscription.id);
    
    if (!existing) {
      console.log('💾 Creating new subscription in database...');
      const newSub = await Subscription.create({
        membership_id: membershipId,
        customer_email: session.customer_details?.email || '',
        customer_name: session.customer_details?.name || '',
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer as string,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      });
      console.log('✅ Subscription created:', newSub);
    } else {
      console.log('ℹ️ Subscription already exists:', existing.Id);
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

            {/* Discord Connection */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-indigo-900 mb-2">Conecta tu cuenta de Discord</p>
                  <p className="text-sm text-indigo-700 mb-3">
                    Vincula tu cuenta de Discord para obtener acceso automático al servidor exclusivo de miembros y recibir tu rol especial.
                  </p>
                  <Link 
                    href={`/api/discord/auth?email=${encodeURIComponent(session.customer_details?.email || '')}`}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Conectar Discord
                  </Link>
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
