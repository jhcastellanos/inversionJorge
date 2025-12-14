import { Course, Order } from '../../../../../lib/models';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../../../lib/auth';
import Link from 'next/link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function CoursePurchasesPage({ params }: { params: { id: string } }) {
  // Validate JWT
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  
  if (!token || !verifyJwt(token)) {
    redirect('/admin/login');
  }

  try {
    const course = await Course.findById(parseInt(params.id));
    if (!course) return notFound();
    const purchases = await Order.findByCourseId(parseInt(params.id));
    
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Compras - {course.Title}</h1>
            <Link 
              href="/admin/dashboard" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay compras registradas para este curso aún.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map((p: any) => (
                    <tr key={p.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.CustomerName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.CustomerEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(p.CreatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${parseFloat(p.Amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {p.PaymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Total de compras:</strong> {purchases.length} | 
              <strong className="ml-4">Ingresos totales:</strong> ${purchases.reduce((sum: number, p: any) => sum + parseFloat(p.Amount), 0).toFixed(2)}
            </p>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 text-lg">Error al cargar las compras.</p>
        </div>
      </div>
    );
  }
}
