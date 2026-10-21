import { requireMemberSession } from '../../lib/getCurrentMember';
import { redirect } from 'next/navigation';
import { syncOnboardingIfHasAccess } from '../../lib/memberOnboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function MemberAppLayout({ children }: { children: React.ReactNode }) {
  let { user, access } = await requireMemberSession();

  if (!access.hasAccess) {
    redirect('/onboarding');
  }

  await syncOnboardingIfHasAccess(user, access);

  return <>{children}</>;
}
