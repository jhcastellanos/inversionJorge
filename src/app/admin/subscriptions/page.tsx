import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Subscription } from '../../../lib/models';
import { verifyJwt } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !verifyJwt(token)) {
    redirect('/admin/login');
  }

  // Get all subscriptions with membership info
  const subscriptions = await Subscription.findAll();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
              <div className="flex gap-4">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                  Cursos
                </Link>
                <Link href="/admin/memberships" className="text-gray-600 hover:text-gray-900">
                  Membresías
                </Link>
                <Link href="/admin/subscriptions" className="text-blue-900 font-semibold">
                  Suscripciones
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Ver sitio
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Suscripciones Activas</h2>
            <p className="text-gray-600 mt-1">Gestiona todas las suscripciones mensuales</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Suscripciones</p>
            <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Activas</p>
            <p className="text-2xl font-bold text-green-600">
              {subscriptions.filter((s: any) => s.Status === 'active' && !s.CancelAtPeriodEnd).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Por Cancelarse</p>
            <p className="text-2xl font-bold text-amber-600">
              {subscriptions.filter((s: any) => s.CancelAtPeriodEnd).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Ingresos Mensuales</p>
            <p className="text-2xl font-bold text-blue-900">
              ${subscriptions
                .filter((s: any) => s.Status === 'active' && !s.CancelAtPeriodEnd)
                .reduce((sum: number, s: any) => sum + parseFloat(s.MonthlyPrice || '0'), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Subscriptions Table */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No hay suscripciones registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suscriptor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membresía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próximo Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription: any) => {
                  const nextPayment = new Date(subscription.CurrentPeriodEnd);
                  const isActive = subscription.Status === 'active' && !subscription.CancelAtPeriodEnd;
                  const willCancel = subscription.CancelAtPeriodEnd;
                  
                  return (
                    <tr key={subscription.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.CustomerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.CustomerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{subscription.MembershipName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${parseFloat(subscription.MonthlyPrice).toFixed(2)}/mes
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(subscription.CreatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {willCancel ? (
                            <span className="text-amber-600 font-medium">
                              Finaliza: {nextPayment.toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          ) : (
                            nextPayment.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ● Activa
                          </span>
                        ) : willCancel ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            ⏱ Por Cancelar
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ✕ Cancelada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`https://dashboard.stripe.com/test/subscriptions/${subscription.StripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:text-blue-950 mr-4"
                        >
                          Ver en Stripe
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
