'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingWizard({
  hasAccess,
  userId,
}: {
  hasAccess: boolean;
  userId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/member/onboarding/complete', { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo completar');
      router.push('/app');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">Paso 1</p>
        <h2 className="text-xl font-bold mt-1">Elige tu membresía</h2>
        <p className="text-gray-600 mt-2 text-sm">
          Compra en la página de planes. Tu acceso se activa cuando Stripe confirme el pago con el
          mismo email de tu cuenta.
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
        <h2 className="text-xl font-bold mt-1">¿Ya pagaste antes en Stripe?</h2>
        <p className="text-gray-600 mt-2 text-sm">
          Si ya tenías suscripción activa, contacta al equipo para que el admin vincule tu{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">stripe_customer_id</code> desde el
          panel. Luego recarga esta página.
        </p>
        <p className="mt-3 text-sm">
          Estado actual:{' '}
          <span
            className={`font-semibold ${hasAccess ? 'text-green-700' : 'text-amber-700'}`}
          >
            {hasAccess ? 'Membresía activa detectada' : 'Sin membresía activa aún'}
          </span>
        </p>
      </div>

      {hasAccess && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6">
          <h2 className="font-bold text-green-900">Listo para entrar</h2>
          <p className="text-sm text-green-800 mt-1">Tu suscripción está activa. Entra a la plataforma.</p>
          <button
            type="button"
            onClick={finish}
            disabled={loading}
            className="mt-4 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Ir a la plataforma'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">ID de cuenta: {userId}</p>
    </div>
  );
}
