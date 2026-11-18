import AdminPageWrapper from '../../../components/AdminPageWrapper';
import AdminSupportTicketsPanel from '../../../components/support/AdminSupportTicketsPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminSupportTicketsPage() {
  return (
    <AdminPageWrapper active="support-tickets">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dudas e inquietudes</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Consultas de miembros. Al abrir un ticket se marca como leído; tu respuesta aparece en la sección privada
          del usuario.
        </p>
        <AdminSupportTicketsPanel />
      </main>
    </AdminPageWrapper>
  );
}