import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../lib/auth';
import { Course } from '../../../lib/models';
import Link from 'next/link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Validate JWT in nodejs runtime (middleware can't validate in Edge)
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  
  if (!token || !verifyJwt(token)) {
    console.log('Dashboard: Invalid token, redirecting to login');
    redirect('/admin/login');
  }
  
  console.log('Dashboard: Token valid, loading courses');
  const courses = await Course.findAll();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">View Site</Link>
            <Link href="/admin/logout" className="text-sm text-red-600 hover:text-red-700">Logout</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
          <Link 
            href="/admin/courses/new" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            + Add Course
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((c: any) => (
                <tr key={c.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{c.Id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.Title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.IsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <Link href={`/admin/courses/${c.Id}/edit`} className="text-blue-600 hover:text-blue-700 font-medium">Edit</Link>
                    <Link href={`/admin/courses/${c.Id}/purchases`} className="text-green-600 hover:text-green-700 font-medium">Purchases</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
