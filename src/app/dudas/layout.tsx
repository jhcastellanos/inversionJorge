import Link from 'next/link';
import { requireMemberSession } from '../../lib/getCurrentMember';
import { canMemberRequestOneOnOne } from '../../lib/oneOnOneAccess';
import MarketingTopBar from '../../components/platform/MarketingTopBar';
import MemberPublicSessionBar from '../../components/platform/MemberPublicSessionBar';
import PlatformShell from '../../components/platform/PlatformShell';
import { isPlatformStaffRole } from '../../lib/platformRoles';
import { getStaffAlertCountsIfNeeded } from '../../lib/staffAlertCounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function DudasPageHeader({ showOneOnOne }: { showOneOnOne: boolean }) {
  return (
    <header className="max-w-3xl mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold ventic-text">Dudas e inquietudes</h1>
        <p className="text-sm ventic-muted mt-1">
          Escríbenos y revisa el estado de tus consultas en tu cuenta privada.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm font-semibold">
        {showOneOnOne && (
          <Link href="/reunion-1a1" className="text-[var(--ventic-accent)] hover:underline">
            Reunión 1-1
          </Link>
        )}
      </nav>
    </header>
  );
}

export default async function DudasLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession({ skipDiscordRequirement: true });
  const showOneOnOne = canMemberRequestOneOnOne(user.platform_role);

  if (access.hasAccess) {
    const staffAlertCounts = await getStaffAlertCountsIfNeeded(access.role);
    return (
      <PlatformShell
        userName={user.full_name.split(' ')[0]}
        showAdminNav={access.role === 'admin'}
        showSupportAlertsNav={isPlatformStaffRole(access.role)}
        showOneOnOneNav={showOneOnOne}
        staffAlertCounts={staffAlertCounts}
      >
        <div className="max-w-3xl">
          <DudasPageHeader showOneOnOne={showOneOnOne} />
          {children}
        </div>
      </PlatformShell>
    );
  }

  return (
    <div className="min-h-screen ventic-bg ventic-text">
      <MarketingTopBar sessionBar={<MemberPublicSessionBar hasAccess={false} />} />
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <DudasPageHeader showOneOnOne={showOneOnOne} />
        <Link href="/onboarding" className="text-sm font-semibold ventic-muted hover:underline">
          Volver a configuración de cuenta
        </Link>
      </div>
      <main className="max-w-3xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}