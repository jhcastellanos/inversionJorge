import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../lib/auth';
import AdminNav from '../../../components/AdminNav';
import ReferralsAdminPanel from '../../../components/ReferralsAdminPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminReferralsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !verifyJwt(token)) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav active="referrals" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReferralsAdminPanel />
      </main>
    </div>
  );
}
