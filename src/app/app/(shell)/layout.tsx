import { requireMemberSession } from '../../../lib/getCurrentMember';
import PlatformShell from '../../../components/platform/PlatformShell';

export default async function MemberShellLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireMemberSession();
  return <PlatformShell userName={user.full_name.split(' ')[0]}>{children}</PlatformShell>;
}
