'use client';

import Link from 'next/link';
import {
  LIVE_EVENT_TIER_AUDIENCE,
  PLATFORM_ROLE_LABELS,
  type PlatformRole,
} from '../../lib/platformRoles';
import { getMembershipPresentation, findPlanDefinition } from '../../lib/membershipPlans';
import { usePlatformPreferences } from './PlatformPreferencesProvider';

type Sub = { membershipName: string; status: string; stripeSubscriptionId: string };

type Props = {
  role: PlatformRole | null;
  subscriptionActive: boolean;
  subscriptions: Sub[];
  membershipCatalog?: Array<{ Name: string; MonthlyPrice: number | string; Description?: string }>;
  monthlyBasePrice: number;
};

function roleAccessSummary(role: PlatformRole | null, subscriptionActive: boolean) {
  if (!role) return 'Sin rol asignado. Contacta a soporte o activa una membresía.';
  const label = PLATFORM_ROLE_LABELS[role];
  if (role === 'admin' || role === 'soporte') {
    return `Acceso completo de plataforma como ${label}.`;
  }
  if (role === 'inversor') {
    return subscriptionActive
      ? `${label}: operativas avanzadas, trading en vivo y academia completa.`
      : `${label} (rol asignado). Para operativas avanzadas en vivo necesitas membresía activa.`;
  }
  if (role === 'trader') {
    return subscriptionActive
      ? `${label}: operativa de trading en vivo, clases y academia básica.`
      : `${label} (rol asignado). Membresía activa requerida para operativas en vivo.`;
  }
  return `${label}: clases grabadas, retrospectivas y contenido según tu plan.`;
}

export default function PlatformMembershipPanel({
  role,
  subscriptionActive,
  subscriptions,
  membershipCatalog = [],
  monthlyBasePrice,
}: Props) {
  const { t, locale } = usePlatformPreferences();
  const primarySub = subscriptions[0];
  const matchedMembership = primarySub
    ? membershipCatalog.find((m) =>
        primarySub.membershipName.toLowerCase().includes(m.Name.toLowerCase().slice(0, 8))
      ) ?? membershipCatalog.find((m) => findPlanDefinition(m.Name))
    : null;

  const planPresentation =
    matchedMembership && monthlyBasePrice > 0
      ? getMembershipPresentation(matchedMembership, monthlyBasePrice)
      : null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold ventic-text">{t('nav.membership')}</h1>
        <p className="ventic-muted mt-2">Tu rol, plan y beneficios en la plataforma.</p>
      </div>

      <section className="rounded-2xl border ventic-border ventic-surface p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider ventic-muted">Rol actual</span>
          <span className="rounded-full bg-ventic-accent-soft border border-[var(--ventic-accent)]/30 px-3 py-1 text-sm font-bold text-[var(--ventic-accent)]">
            {role ? PLATFORM_ROLE_LABELS[role] : 'Sin rol'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              subscriptionActive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
            }`}
          >
            {subscriptionActive ? 'Membresía activa' : 'Sin suscripción activa'}
          </span>
        </div>
        <p className="text-sm ventic-text leading-relaxed">{roleAccessSummary(role, subscriptionActive)}</p>

        {subscriptions.length > 0 && (
          <ul className="space-y-3 pt-2 border-t ventic-border">
            {subscriptions.map((sub) => (
              <li key={sub.stripeSubscriptionId} className="rounded-xl border ventic-border bg-ventic-accent-soft/40 p-4">
                <p className="font-semibold ventic-text">{sub.membershipName}</p>
                <p className="text-sm ventic-muted mt-1 capitalize">Estado Stripe: {sub.status}</p>
              </li>
            ))}
          </ul>
        )}

        {planPresentation && (
          <div className="pt-4 border-t ventic-border">
            <p className="text-xs font-bold uppercase tracking-wider ventic-muted mb-3">Beneficios de tu plan</p>
            <ul className="space-y-2">
              {planPresentation.features.map((f) => (
                <li key={f.label} className={`flex gap-2 text-sm ${f.included ? 'ventic-text' : 'ventic-muted line-through opacity-60'}`}>
                  <span>{f.included ? '✓' : '✕'}</span>
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border ventic-border ventic-surface p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--ventic-accent-muted)] mb-3">
          Acceso a eventos en vivo
        </p>
        <ul className="space-y-2 text-sm ventic-muted">
          {(Object.entries(LIVE_EVENT_TIER_AUDIENCE) as [keyof typeof LIVE_EVENT_TIER_AUDIENCE, string][]).map(
            ([tier, audience]) => (
              <li key={tier} className="flex gap-2">
                <span className="text-[var(--ventic-accent)] shrink-0">•</span>
                <span>{audience}</span>
              </li>
            )
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/planes"
          className="rounded-lg bg-[var(--ventic-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ventic-accent-hover)]"
        >
          Ver o cambiar plan
        </Link>
        <Link
          href="/app/suscripciones"
          className="rounded-lg border ventic-border px-5 py-2.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft"
        >
          {locale === 'en' ? 'Manage subscriptions' : 'Gestionar suscripciones'}
        </Link>
      </div>
    </div>
  );
}
