import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { isPlatformStaffRole } from '../../../../lib/platformRoles';
import AdminSupportTicketsPanel from '../../../../components/support/AdminSupportTicketsPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function GestionarConsultasPage() {
  const { access } = await requireMemberSession();
  if (!isPlatformStaffRole(access.role)) {
    redirect('/app');
  }

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold ventic-text">Consultas de miembros</h1>
        <p className="text-sm ventic-muted mt-1">
          Dudas e inquietudes. Responde aquí; el usuario verá tu mensaje en su cuenta.
        </p>
      </header>
      <AdminSupportTicketsPanel />
    </div>
  );
}