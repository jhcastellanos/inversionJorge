import { requireMemberSession } from '../../lib/getCurrentMember';
import PlatformShell from '../../components/platform/PlatformShell';
import { redirect } from 'next/navigation';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  let { user, access } = await requireMemberSession();

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  user = await syncOnboardingIfHasAccess(user, access);

  return <PlatformShell userName={user.full_name.split(' ')[0]}>{children}</PlatformShell>;
}
