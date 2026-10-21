'use client';

import Link from 'next/link';

export default function OnboardingWizard({
  hasAccess,
  subscriptionActive,
  userId,
}: {
  hasAccess: boolean;
  subscriptionActive: boolean;
  userId: number;
}) {
  if (hasAccess) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">
      {subscriptionActive && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="font-bold">Tienes membresía activa en Stripe</h2>
          <p className="text-sm mt-2">
            Aún no tienes rol en la plataforma. Contacta a soporte para que te asignen el rol
            correcto (Trader, Inversor, etc.) según tu plan.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">Paso 1</p>
        <h2 className="text-xl font-bold mt-1">Elige tu membresía</h2>
        <p className="text-gray-600 mt-2 text-sm">
          La suscripción debe estar <strong>activa</strong> y el admin debe vincular tu{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">cus_…</code> en usuarios de plataforma.
        </p>
        <Link
          href="/planes"
          className="inline-block mt-4 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Ver membresías y pagar
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">Paso 2</p>
        <h2 className="text-xl font-bold mt-1">Rol en la plataforma</h2>
        <p className="text-gray-600 mt-2 text-sm">
          Sin rol asignado no puedes entrar al CRM. Pide al admin un rol (Estudiante, Trader,
          Inversor…) o la vinculación de Stripe.
        </p>
        <p className="mt-3 text-sm">
          Estado:{' '}
          <span className="font-semibold text-amber-700">
            {subscriptionActive
              ? 'Suscripción activa — falta rol asignado'
              : 'Sin rol y sin suscripción activa vinculada'}
          </span>
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">ID de cuenta: {userId}</p>
    </div>
  );
}
