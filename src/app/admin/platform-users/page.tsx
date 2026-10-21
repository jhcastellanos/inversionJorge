import AdminPageWrapper from '../../../components/AdminPageWrapper';
import PlatformUsersAdminPanel from '../../../components/platform/PlatformUsersAdminPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminPlatformUsersPage() {
  return (
    <AdminPageWrapper active="platform-users">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuarios de la plataforma</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Vincula <code className="bg-gray-100 px-1 rounded">stripe_customer_id</code> o asigna rol (Admin, Soporte,
          Inversor, Trader, Estudiante). Trader/Inversor sin suscripción activa pasan a Estudiante. Solo Admin puede eliminar usuarios.
        </p>
        <PlatformUsersAdminPanel />
      </main>
    </AdminPageWrapper>
  );
}
