import AdminNav from './AdminNav';
import { requireStaffPage } from '../lib/staffAccess';

type AdminNavActive =
  | 'courses'
  | 'memberships'
  | 'subscriptions'
  | 'referrals'
  | 'platform-users'
  | 'platform-content';

export default async function AdminPageWrapper({
  active,
  requireManageContent,
  children,
}: {
  active: AdminNavActive;
  requireManageContent?: boolean;
  children: React.ReactNode;
}) {
  const staff = await requireStaffPage({ requireManageContent });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav
        active={active}
        showPlatformContent={staff.capabilities.canManagePlatformContent}
      />
      {children}
    </div>
  );
}
