import { requireMemberSession } from '../../../lib/getCurrentMember';
import ContactSupportRoleBanner from '../../../components/platform/ContactSupportRoleBanner';

export default async function MemberShellLayout({ children }: { children: React.ReactNode }) {
  const { access } = await requireMemberSession();
  return (
    <>
      {access.contactSupportForRoleUpgrade && (
        <div className="mb-6">
          <ContactSupportRoleBanner />
        </div>
      )}
      {children}
    </>
  );
}
