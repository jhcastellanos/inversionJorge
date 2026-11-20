import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMemberSession } from '../../lib/getCurrentMember';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import MemberPublicSessionBar from '../../components/platform/MemberPublicSessionBar';
import PlatformShell from '../../components/platform/PlatformShell';
import { canMemberRequestOneOnOne } from '../../lib/oneOnOneAccess';
import { ONE_ON_ONE_DURATION_MINUTES } from '../../lib/oneOnOneMeetings.constants';
import { isPlatformStaffRole } from '../../lib/platformRoles';
import { getStaffAlertCountsIfNeeded } from '../../lib/staffAlertCounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ReunionPageHeader() {
  return (
    <header className="max-w-3xl mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold ventic-text">Reunión 1-1 con la academia</h1>
        <p className="text-sm ventic-muted mt-1">
          Para visitantes y miembros: entrenamiento, dudas y acompañamiento personalizado. Cada sesión dura{' '}
          {ONE_ON_ONE_DURATION_MINUTES} minutos — conviene llegar con las dudas claras.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link href="/dudas" className="text-[var(--ventic-accent)] hover:underline">
          Dudas escritas
        </Link>
      </nav>
    </header>
  );
}

export default async function ReunionOneOnOneLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession({ skipDiscordRequirement: true });

  if (!canMemberRequestOneOnOne(user.platform_role)) {
    redirect('/admin/reuniones-1a1');
  }

  if (access.hasAccess) {
    const staffAlertCounts = await getStaffAlertCountsIfNeeded(access.role);
    return (
      <PlatformShell
        userName={user.full_name.split(' ')[0]}
        showAdminNav={access.role === 'admin'}
        showSupportAlertsNav={isPlatformStaffRole(access.role)}
        showOneOnOneNav
        staffAlertCounts={staffAlertCounts}
      >
        <div className="max-w-3xl">
          <ReunionPageHeader />
          {children}
        </div>
      </PlatformShell>
    );
  }

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar
        sessionBar={<MemberPublicSessionBar hasAccess={false} />}
      />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ReunionPageHeader />
        <Link href="/onboarding" className="text-sm font-semibold ventic-muted hover:underline">
          Volver a configuración de cuenta
        </Link>
      </div>
      <main className="max-w-3xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}