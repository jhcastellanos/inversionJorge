'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingWizard({
  subscriptionActive,
  userEmail,
}: {
  subscriptionActive: boolean;
  userEmail: string;
}) {
  const router = useRouter();
  const [checkingPortal, setCheckingPortal] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);

  const tryEnterPortal = async () => {
    setCheckingPortal(true);
    setPortalMessage(null);
    try {
      const res = await fetch('/api/member/onboarding/enter-portal', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.replace('/app');
        router.refresh();
        return;
      }
      setPortalMessage(
        typeof data.error === 'string'
          ? data.error
          : 'Aún no tienes rol asignado. Si soporte ya te activó, espera un momento e inténtalo de nuevo.'
      );
    } catch {
      setPortalMessage('Error de conexión. Revisa tu red e inténtalo otra vez.');
    } finally {
      setCheckingPortal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">
      {subscriptionActive && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-6 ventic-text">
          <h2 className="font-bold text-amber-200">Pago detectado</h2>
          <p className="text-sm mt-2 ventic-muted">
            Vemos una membresía activa asociada a tu cuenta. Escríbenos a soporte para completar tu
            inscripción y activar el acceso a la plataforma.
          </p>
        </div>
      )}

      <div className="rounded-2xl ventic-surface border ventic-border p-6 sm:p-8 shadow-sm">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ventic-accent-muted)]">
          Paso 1
        </p>
        <h2 className="text-xl font-bold ventic-text mt-1">Elige tu plan y realiza el pago</h2>
        <p className="ventic-muted mt-3 text-sm leading-relaxed">
          Revisa las membresías disponibles y completa el pago con el mismo correo con el que iniciaste
          sesión (<span className="font-medium ventic-text">{userEmail}</span>).
        </p>
        <Link
          href="/planes"
          className="inline-block mt-5 rounded-lg bg-[var(--ventic-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)]"
        >
          Ver membresías
        </Link>
      </div>

      <div className="rounded-2xl ventic-surface border ventic-border p-6 sm:p-8 shadow-sm">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ventic-accent-muted)]">
          Paso 2
        </p>
        <h2 className="text-xl font-bold ventic-text mt-1">Completa tu inscripción con soporte</h2>
        <p className="ventic-muted mt-3 text-sm leading-relaxed">
          Después de pagar, <strong className="ventic-text">contacta al equipo de soporte</strong> para
          que validen tu pago y activen tu acceso al CRM (clases, calendario y contenido según tu plan).
          Este paso lo hace el equipo; no necesitas configurar nada técnico en tu cuenta.
        </p>
        <p className="mt-4 text-sm ventic-muted">
          Estado:{' '}
          <span className="font-semibold text-amber-400/90">
            {subscriptionActive
              ? 'Pago registrado — pendiente activación por soporte'
              : 'Pendiente de pago o confirmación por soporte'}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--ventic-accent)]/30 bg-[var(--ventic-accent)]/10 p-6 sm:p-8 text-center">
        <p className="text-sm ventic-text font-medium">
          ¿Soporte ya te asignó el rol y sigues viendo esta pantalla?
        </p>
        <p className="text-xs ventic-muted mt-2">
          Solo podrás entrar si tu cuenta ya tiene rol en el sistema (Estudiante, Trader, etc.). Pagar
          o tener suscripción sin rol no es suficiente.
        </p>
        <button
          type="button"
          disabled={checkingPortal}
          onClick={() => void tryEnterPortal()}
          className="mt-4 rounded-lg bg-[var(--ventic-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)] disabled:opacity-60"
        >
          {checkingPortal ? 'Comprobando…' : 'Ir al portal'}
        </button>
        {portalMessage ? (
          <p className="mt-3 text-sm text-amber-400/90 max-w-md mx-auto">{portalMessage}</p>
        ) : null}
      </div>

      <p className="text-xs ventic-muted text-center">
        ¿Ya pagaste? Envía tu comprobante a soporte indicando tu correo{' '}
        <span className="font-medium ventic-text">{userEmail}</span>.
      </p>
    </div>
  );
}