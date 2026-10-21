import { requireMemberSession } from '../../../lib/getCurrentMember';
import PlatformShell from '../../../components/platform/PlatformShell';
import ContactSupportRoleBanner from '../../../components/platform/ContactSupportRoleBanner';

export default async function MemberShellLayout({ children }: { children: React.ReactNode }) {
  const { user, access } = await requireMemberSession();
  return (
    <PlatformShell userName={user.full_name.split(' ')[0]}>
      {access.contactSupportForRoleUpgrade && (
        <div className="mb-6">
          <ContactSupportRoleBanner />
        </div>
      )}
      {children}
    </PlatformShell>
  );
}
