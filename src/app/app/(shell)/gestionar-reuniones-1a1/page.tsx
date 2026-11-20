import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { isPlatformStaffRole } from '../../../../lib/platformRoles';
import AdminOneOnOnePanel from '../../../../components/oneOnOne/AdminOneOnOnePanel';
import { ONE_ON_ONE_PRICE_USD } from '../../../../lib/oneOnOneMeetings.constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function GestionarReunionesOneOnOnePage() {
  const { access } = await requireMemberSession();
  if (!isPlatformStaffRole(access.role)) {
    redirect('/app');
  }

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold ventic-text">Reuniones 1-1</h1>
        <p className="text-sm ventic-muted mt-1">
          Aprueba horarios, propón alternativas o rechaza. El pago (USD {ONE_ON_ONE_PRICE_USD}) solo después de
          acordar el horario con el miembro.
        </p>
      </header>
      <AdminOneOnOnePanel />
    </div>
  );
}