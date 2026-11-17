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
          Listado de todos los miembros con <strong>rol</strong>, estado de <strong>Discord</strong> (vinculación
          obligatoria) y <strong>Stripe</strong>. Puedes asignar roles o vincular <code className="bg-gray-100 px-1 rounded">cus_…</code> manualmente. Solo Admin puede eliminar usuarios.
        </p>
        <PlatformUsersAdminPanel />
      </main>
    </AdminPageWrapper>
  );
}
