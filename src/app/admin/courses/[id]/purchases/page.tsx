import { Course, Order } from '../../../../../lib/models';
import { notFound } from 'next/navigation';

export default async function CoursePurchasesPage({ params }: { params: { id: string } }) {
  try {
    const course = await Course.findById(parseInt(params.id));
    if (!course) return notFound();
    const purchases = await Order.findByCourseId(parseInt(params.id));
    return (
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Purchases for {course.Title}</h1>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Customer</th>
              <th className="p-2">Email</th>
              <th className="p-2">Date</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p: any) => (
              <tr key={p.Id} className="border-t">
                <td className="p-2">{p.CustomerName || '-'}</td>
                <td className="p-2">{p.CustomerEmail}</td>
                <td className="p-2">{new Date(p.CreatedAt).toLocaleString()}</td>
                <td className="p-2">${'{'}parseFloat(p.Amount).toFixed(2){'}'}</td>
                <td className="p-2">{p.PaymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  } catch (error) {
    return <div className="p-8 text-red-600">Error loading purchases.</div>;
  }
}
