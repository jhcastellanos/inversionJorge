import { Course, Purchase } from '../../../../../lib/models';
import { notFound } from 'next/navigation';

export default async function CoursePurchasesPage({ params }: { params: { id: string } }) {
  try {
    const course = await Course.findById(parseInt(params.id));
    if (!course) return notFound();
    const purchases = await Purchase.findByCourseId(parseInt(params.id));
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
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.full_name || '-'}</td>
                <td className="p-2">{p.email}</td>
                <td className="p-2">{new Date(p.purchased_at).toLocaleString()}</td>
                <td className="p-2">${'{'}parseFloat(p.amount_paid).toFixed(2){'}'}</td>
                <td className="p-2">{p.payment_status}</td>
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
