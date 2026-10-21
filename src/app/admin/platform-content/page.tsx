import AdminPageWrapper from '../../../components/AdminPageWrapper';
import PlatformContentAdminPanel from '../../../components/platform/PlatformContentAdminPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function PlatformContentAdminPage() {
  return (
    <AdminPageWrapper active="platform-content" requireManageContent>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Clases y calendario (plataforma)</h2>
        <p className="text-sm text-gray-600 mb-6">
          Tipos de clase: básicas (Alumno+) y avanzadas (Inversor+). Eventos: básicos (Alumno), medios (Trader+),
          avanzados (Inversor+).
        </p>
        <PlatformContentAdminPanel />
      </main>
    </AdminPageWrapper>
  );
}
