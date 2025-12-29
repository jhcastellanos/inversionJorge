import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Membership } from '../../../lib/models';
import DeleteMembershipButton from '../../../components/DeleteMembershipButton';

export const dynamic = 'force-dynamic';

export default async function AdminMembershipsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    redirect('/admin/login');
  }

  const memberships = await Membership.findAll();

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
                <Link href="/admin/memberships" className="text-indigo-600 font-semibold">
                  Membresías
                </Link>
                <Link href="/admin/subscriptions" className="text-gray-600 hover:text-gray-900">
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
            <h2 className="text-2xl font-bold text-gray-900">Membresías</h2>
            <p className="text-gray-600 mt-1">Gestiona las membresías mensuales disponibles</p>
          </div>
          <Link
            href="/admin/memberships/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva Membresía
          </Link>
        </div>

        {/* Memberships Grid */}
        {memberships.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No hay membresías creadas</p>
            <Link
              href="/admin/memberships/create"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Crear primera membresía
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((membership: any) => (
              <div key={membership.Id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{membership.Name}</h3>
                    {membership.IsActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactiva
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{membership.Description}</p>
                  
                  <div className="text-3xl font-bold text-indigo-600 mb-4">
                    ${parseFloat(membership.MonthlyPrice).toFixed(2)}
                    <span className="text-lg text-gray-500 font-normal">/mes</span>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Beneficios:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {membership.Benefits.split('\n').slice(0, 3).map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="line-clamp-1">{benefit}</span>
                        </li>
                      ))}
                      {membership.Benefits.split('\n').length > 3 && (
                        <li className="text-gray-400 text-xs">
                          +{membership.Benefits.split('\n').length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/memberships/${membership.Id}/edit`}
                      className="flex-1 bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <div className="flex-1">
                      <DeleteMembershipButton 
                        membershipId={membership.Id} 
                        membershipName={membership.Name}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
