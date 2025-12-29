'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SubscriptionData {
  Id: number;
  MembershipName: string;
  MonthlyPrice: number;
  Status: string;
  CurrentPeriodEnd: string;
  CancelAtPeriodEnd: boolean;
  StripeSubscriptionId: string;
  StripeCustomerId: string;
  DiscordUserId?: string;
}

interface DiscordConnectionData {
  connected: boolean;
  discordUsername?: string;
  discordUserId?: string;
}

function ManageSubscriptionContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [showEmailInput, setShowEmailInput] = useState(!emailFromUrl);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState<number | null>(null);
  const [redirectingPortal, setRedirectingPortal] = useState<number | null>(null);
  const [discordConnection, setDiscordConnection] = useState<DiscordConnectionData | null>(null);
  const [loadingDiscord, setLoadingDiscord] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('discord_connected') === 'true') {
      alert('¡Discord conectado exitosamente! Se te ha asignado el rol de miembro.');
    }
    if (params.get('error') === 'discord_auth_failed') {
      alert('Error al conectar con Discord. Por favor intenta de nuevo.');
    }
  }, []);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setShowEmailInput(false);
      fetchSubscriptions(emailFromUrl);
      fetchDiscordConnection(emailFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromUrl]);

  const fetchDiscordConnection = async (emailToFetch?: string) => {
    const targetEmail = emailToFetch || email;
    if (!targetEmail) return;
    
    setLoadingDiscord(true);
    try {
      const res = await fetch(`/api/discord/status?email=${encodeURIComponent(targetEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setDiscordConnection(data);
      }
    } catch (error) {
      console.error('Error fetching Discord connection:', error);
    } finally {
      setLoadingDiscord(false);
    }
  };

  const fetchSubscriptions = async (emailToFetch?: string) => {
    const targetEmail = emailToFetch || email;
    if (!targetEmail) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?email=${targetEmail}`);
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setShowEmailInput(false);
      fetchSubscriptions(email);
      fetchDiscordConnection(email);
    }
  };

  const handleOpenPortal = async (subscriptionId: number, customerId: string) => {
    setRedirectingPortal(subscriptionId);
    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      });
      
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo abrir el portal'}`);
        setRedirectingPortal(null);
      }
    } catch (error) {
      alert('Error al abrir el portal de gestión');
      setRedirectingPortal(null);
    }
  };

  const handleCancel = async (subscriptionId: number, stripeSubId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Mantendrás acceso hasta el final del período pagado, pero no se realizarán más cobros.')) {
      return;
    }

    setCanceling(subscriptionId);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSubscriptionId: stripeSubId })
      });
      
      if (res.ok) {
        alert('Suscripción cancelada exitosamente. Mantendrás acceso hasta el final del período pagado.');
        fetchSubscriptions(); // Refresh data
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo cancelar la suscripción'}`);
      }
    } catch (error) {
      alert('Error al cancelar la suscripción');
    } finally {
      setCanceling(null);
    }
  };

  if (!email || showEmailInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Suscripciones</h1>
              <p className="text-gray-600">Ingresa tu email para ver y gestionar tus suscripciones</p>
            </div>
            
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Ver mis suscripciones
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Usa el mismo email que utilizaste al realizar tu suscripción
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando suscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Suscripciones</h1>
              <p className="text-gray-600">Cuenta: <span className="font-semibold">{email}</span></p>
            </div>
            <button
              onClick={() => setShowEmailInput(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Cambiar cuenta
            </button>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes suscripciones activas</h2>
            <p className="text-gray-600 mb-6">Explora nuestras membresías disponibles</p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Ver membresías
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Discord Connection Section */}
            {subscriptions.some(sub => sub.Status === 'active') && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <svg className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Conexión Discord</h3>
                    {loadingDiscord ? (
                      <p className="text-indigo-700">Cargando...</p>
                    ) : discordConnection?.connected ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✓ Conectado
                          </span>
                          <span className="text-indigo-900 font-medium">{discordConnection.discordUsername}</span>
                        </div>
                        <p className="text-sm text-indigo-700 mb-3">
                          Tu cuenta de Discord está vinculada. Tienes acceso automático al servidor de miembros con tu rol especial.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-indigo-700 mb-3">
                          Conecta tu cuenta de Discord para obtener acceso automático al servidor exclusivo de miembros.
                        </p>
                        <Link 
                          href={`/api/discord/auth?email=${encodeURIComponent(email)}`}
                          className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                          Conectar Discord
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {subscriptions.map((sub) => (
              <div key={sub.Id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{sub.MembershipName}</h3>
                      {sub.Status === 'active' && !sub.CancelAtPeriodEnd && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Activa
                        </span>
                      )}
                      {sub.CancelAtPeriodEnd && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Se cancela al final del período
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Precio:</span> ${parseFloat(sub.MonthlyPrice.toString()).toFixed(2)}/mes</p>
                      <p><span className="font-medium">Próximo cobro:</span> {new Date(sub.CurrentPeriodEnd).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {sub.Status === 'active' && (
                      <button
                        onClick={() => handleOpenPortal(sub.Id, sub.StripeCustomerId)}
                        disabled={redirectingPortal === sub.Id}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {redirectingPortal === sub.Id ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Redirigiendo...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Gestionar Suscripción
                          </>
                        )}
                      </button>
                    )}
                    {sub.Status === 'active' && !sub.CancelAtPeriodEnd && (
                      <button
                        onClick={() => handleCancel(sub.Id, sub.StripeSubscriptionId)}
                        disabled={canceling === sub.Id}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {canceling === sub.Id ? 'Cancelando...' : 'Cancelar suscripción'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Portal de Gestión</p>
              <p className="mb-2">Desde el Portal de Cliente puedes:</p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                <li>Actualizar tu método de pago</li>
                <li>Ver y descargar todas tus facturas</li>
                <li>Cancelar o reactivar suscripciones</li>
                <li>Ver tu historial de pagos completo</li>
              </ul>
              <p className="font-semibold mb-1">Política de cancelación</p>
              <p>Al cancelar tu suscripción, mantendrás acceso completo hasta el final del período que ya has pagado. No se realizarán más cobros automáticos. Los pagos procesados no son reembolsables.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ManageSubscriptionContent />
    </Suspense>
  );
}
