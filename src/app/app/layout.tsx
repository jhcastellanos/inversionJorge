import { requireMemberSession } from '../../lib/getCurrentMember';
import PlatformShell from '../../components/platform/PlatformShell';
import { redirect } from 'next/navigation';
import { isPlatformStaffRole, parsePlatformRole } from '../../lib/platformRoles';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  let { user, access } = await requireMemberSession();

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  user = await syncOnboardingIfHasAccess(user, access);

  const staffRole = parsePlatformRole(user.platform_role);
  const showAdminLink = isPlatformStaffRole(staffRole);

  return (
    <PlatformShell userName={user.full_name.split(' ')[0]} showAdminLink={showAdminLink}>
      {children}
    </PlatformShell>
  );
}
