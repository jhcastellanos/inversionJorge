import Link from 'next/link';
import { requireMemberSession } from '../../../../lib/getCurrentMember';

export default async function MembresiaPage() {
  const { access } = await requireMemberSession();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">Mi membresía</h1>
      <p className="text-gray-600 mt-2">Tu acceso depende de tu suscripción activa en Stripe.</p>

      {access.hasAccess ? (
        <ul className="mt-6 space-y-3">
          {access.subscriptions.map((sub) => (
            <li
              key={sub.stripeSubscriptionId}
              className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm"
            >
              <p className="font-semibold text-gray-900">{sub.membershipName}</p>
              <p className="text-sm text-gray-600">Estado: {sub.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-6">
          <p className="text-amber-900">No hay suscripción activa vinculada a tu cuenta.</p>
          <Link href="/planes" className="inline-block mt-4 text-sm font-semibold text-blue-900">
            Ver planes →
          </Link>
        </div>
      )}

      <Link
        href="/subscription/manage"
        className="inline-block mt-8 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Gestionar pago en Stripe
      </Link>
    </div>
  );
}
