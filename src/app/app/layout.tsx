import { requireMemberSession } from '../../lib/getCurrentMember';
import { redirect } from 'next/navigation';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';
import PlatformShell from '../../components/platform/PlatformShell';
import { isPlatformStaffRole } from '../../lib/platformRoles';
import { getStaffAlertCountsIfNeeded } from '../../lib/staffAlertCounts';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  let { user, access } = await requireMemberSession();

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  await syncOnboardingIfHasAccess(user, access);

  const staffAlertCounts = await getStaffAlertCountsIfNeeded(access.role);

  return (
    <PlatformShell
      userName={user.full_name.split(' ')[0]}
      showAdminNav={access.role === 'admin'}
      showSupportAlertsNav={isPlatformStaffRole(access.role)}
      showOneOnOneNav={access.role !== 'admin'}
      staffAlertCounts={staffAlertCounts}
    >
      {children}
    </PlatformShell>
  );
}
