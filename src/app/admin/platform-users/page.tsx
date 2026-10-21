import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../lib/auth';
import AdminNav from '../../../components/AdminNav';
import PlatformUsersAdminPanel from '../../../components/platform/PlatformUsersAdminPanel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminPlatformUsersPage() {
  const token = cookies().get('admin_token')?.value;
  if (!token || !verifyJwt(token)) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav active="platform-users" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuarios de la plataforma</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Vincula <code className="bg-gray-100 px-1 rounded">stripe_customer_id</code> o asigna rol
          (Admin, Inversor, Trader, Alumno). El rol da acceso sin depender de Stripe.
        </p>
        <PlatformUsersAdminPanel />
      </main>
    </div>
  );
}
