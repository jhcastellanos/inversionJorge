'use client';

import ResponsiveLanding from '../ResponsiveLanding';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import { PLATFORM_ROLE_LABELS, type PlatformRole } from '../../lib/platformRoles';

type Props = {
  courses: unknown[];
  memberships: unknown[];
  role: PlatformRole | null;
  subscriptionActive: boolean;
  embedded?: boolean;
};

export default function PlatformPlansPanel({
  courses,
  memberships,
  role,
  subscriptionActive,
  embedded = true,
}: Props) {
  const { t } = usePlatformPreferences();

  return (
    <div className={embedded ? 'max-w-7xl mx-auto' : ''}>
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold ventic-text">Planes y cursos</h1>
        <p className="ventic-muted mt-2 max-w-2xl">
          {subscriptionActive
            ? 'Revisa otros planes o cursos disponibles. Los cambios de facturación se gestionan en Stripe.'
            : 'Elige la membresía que mejor se adapte a ti. Tras el pago, tu acceso se vincula a tu cuenta.'}
        </p>
        {(role || subscriptionActive) && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            {role && (
              <span className="rounded-full bg-ventic-accent-soft border border-[var(--ventic-accent)]/30 px-3 py-1 text-xs font-bold text-[var(--ventic-accent)]">
                Rol: {PLATFORM_ROLE_LABELS[role]}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                subscriptionActive
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/15 text-amber-800'
              }`}
            >
              {subscriptionActive ? 'Suscripción activa' : 'Sin suscripción activa'}
            </span>
          </div>
        )}
      </header>

      <ResponsiveLanding courses={courses} memberships={memberships} variant="ventic" stickyOffset={embedded ? 0 : 73} />

      {embedded && (
        <p className="mt-10 text-center text-sm ventic-muted">
          ¿Dudas con tu plan? Usa{' '}
          <a href="/app/membresia" className="font-semibold text-[var(--ventic-accent)] hover:underline">
            {t('nav.membership')}
          </a>{' '}
          o gestiona el pago en Stripe.
        </p>
      )}
    </div>
  );
}
