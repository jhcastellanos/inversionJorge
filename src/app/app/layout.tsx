import { requireMemberSession } from '../../lib/getCurrentMember';
import { redirect } from 'next/navigation';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';
import PlatformShell from '../../components/platform/PlatformShell';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  let { user, access } = await requireMemberSession();

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  await syncOnboardingIfHasAccess(user, access);

  return (
    <PlatformShell userName={user.full_name.split(' ')[0]} showAdminNav={access.role === 'admin'}>
      {children}
    </PlatformShell>
  );
}
