import { requireMemberSession } from '../../lib/getCurrentMember';
import PlatformShell from '../../components/platform/PlatformShell';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession();

  if (access.hasAccess && !user.onboarding_completed) {
    redirect('/onboarding');
  }

  return <PlatformShell userName={user.full_name.split(' ')[0]}>{children}</PlatformShell>;
}
