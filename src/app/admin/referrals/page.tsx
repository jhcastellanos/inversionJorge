import AdminPageWrapper from '../../../components/AdminPageWrapper';
import ReferralsAdminPanel from '../../../components/ReferralsAdminPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminReferralsPage() {
  return (
    <AdminPageWrapper active="referrals">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReferralsAdminPanel />
      </main>
    </AdminPageWrapper>
  );
}
