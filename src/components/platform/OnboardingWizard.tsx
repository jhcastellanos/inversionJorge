'use client';

import Link from 'next/link';

export default function OnboardingWizard({
  subscriptionActive,
  userEmail,
}: {
  subscriptionActive: boolean;
  userEmail: string;
}) {
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

      <p className="text-xs ventic-muted text-center">
        ¿Ya pagaste? Envía tu comprobante a soporte indicando tu correo{' '}
        <span className="font-medium ventic-text">{userEmail}</span>.
      </p>
    </div>
  );
}
