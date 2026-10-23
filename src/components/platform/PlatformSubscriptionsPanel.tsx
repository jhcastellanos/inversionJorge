'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatformPreferences } from './PlatformPreferencesProvider';

export type SubscriptionRow = {
  Id: number;
  MembershipName: string;
  MonthlyPrice: number;
  Status: string;
  CurrentPeriodEnd: string;
  CancelAtPeriodEnd: boolean;
  StripeSubscriptionId: string;
  StripeCustomerId: string;
};

type Props = {
  initialEmail?: string | null;
  embedded?: boolean;
  allowEmailChange?: boolean;
};

export default function PlatformSubscriptionsPanel({
  initialEmail,
  embedded = false,
  allowEmailChange = false,
}: Props) {
  const { t, locale } = usePlatformPreferences();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [showEmailInput, setShowEmailInput] = useState(!initialEmail);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState<number | null>(null);
  const [redirectingPortal, setRedirectingPortal] = useState<number | null>(null);

  const dateLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const backHref = embedded ? '/app/membresia' : '/';

  const fetchSubscriptions = useCallback(async (emailToFetch: string) => {
    if (!emailToFetch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?email=${encodeURIComponent(emailToFetch.trim())}`);
      const data = await res.json();
      const rows: SubscriptionRow[] = data.subscriptions ?? [];
      const seen = new Set<string>();
      setSubscriptions(
        rows.filter((sub) => {
          const key = sub.StripeSubscriptionId || String(sub.Id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      );
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setShowEmailInput(false);
      void fetchSubscriptions(initialEmail);
    }
  }, [initialEmail, fetchSubscriptions]);

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setShowEmailInput(false);
      void fetchSubscriptions(email);
    }
  };

  const handleOpenPortal = async (subscriptionId: number, customerId: string) => {
    setRedirectingPortal(subscriptionId);
    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo abrir el portal'}`);
        setRedirectingPortal(null);
      }
    } catch {
      alert('Error al abrir el portal de gestión');
      setRedirectingPortal(null);
    }
  };

  const handleCancel = async (subscriptionId: number, stripeSubId: string) => {
    if (
      !confirm(
        locale === 'en'
          ? 'Cancel subscription? You keep access until the paid period ends.'
          : '¿Cancelar suscripción? Mantendrás acceso hasta el final del período pagado.'
      )
    ) {
      return;
    }
    setCanceling(subscriptionId);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSubscriptionId: stripeSubId }),
      });
      if (res.ok) {
        alert(
          locale === 'en'
            ? 'Subscription canceled. Access continues until period end.'
            : 'Suscripción cancelada. Mantendrás acceso hasta el final del período.'
        );
        void fetchSubscriptions(email);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo cancelar'}`);
      }
    } catch {
      alert('Error al cancelar la suscripción');
    } finally {
      setCanceling(null);
    }
  };

  const shellClass = embedded ? 'max-w-3xl mx-auto' : 'min-h-screen ventic-bg ventic-text py-10 px-4';

  if (!email || showEmailInput) {
    return (
      <div className={shellClass}>
        <Link href={backHref} className="text-sm font-semibold text-[var(--ventic-accent)] hover:underline mb-6 inline-block">
          ← {embedded ? t('subscriptions.backToApp') : t('subscriptions.backToApp')}
        </Link>
        <div className="rounded-2xl border ventic-border ventic-surface p-8 shadow-sm max-w-md mx-auto">
          <h1 className="text-2xl font-bold ventic-text">{t('subscriptions.title')}</h1>
          <p className="ventic-muted mt-2 text-sm">{t('subscriptions.emailPrompt')}</p>
          <form onSubmit={handleSubmitEmail} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium ventic-text">{t('subscriptions.emailLabel')}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="mt-1 w-full rounded-lg border ventic-border bg-transparent px-4 py-3 text-sm ventic-text focus:border-[var(--ventic-accent)] outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--ventic-accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--ventic-accent-hover)]"
            >
              {t('subscriptions.submit')}
            </button>
          </form>
          <p className="mt-4 text-xs ventic-muted rounded-lg bg-ventic-accent-soft p-3">{t('subscriptions.emailTip')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${shellClass} flex items-center justify-center min-h-[40vh]`}>
        <p className="ventic-muted">{t('subscriptions.loading')}</p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <Link href={backHref} className="text-sm font-semibold text-[var(--ventic-accent)] hover:underline mb-6 inline-block">
        ← {t('subscriptions.backToApp')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold ventic-text">{t('subscriptions.title')}</h1>
          <p className="ventic-muted mt-1 text-sm">
            {t('subscriptions.account')}: <span className="font-semibold ventic-text">{email}</span>
          </p>
        </div>
        {allowEmailChange && (
          <button
            type="button"
            onClick={() => setShowEmailInput(true)}
            className="text-sm font-semibold text-[var(--ventic-accent)] hover:underline"
          >
            {t('subscriptions.changeAccount')}
          </button>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border ventic-border ventic-surface p-10 text-center">
          <p className="ventic-text font-semibold">{t('subscriptions.empty')}</p>
          <Link
            href={embedded ? '/app/planes' : '/planes'}
            className="inline-block mt-6 rounded-lg bg-[var(--ventic-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {t('subscriptions.explore')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((sub) => (
            <li key={sub.StripeSubscriptionId || sub.Id} className="rounded-2xl border ventic-border ventic-surface p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold ventic-text">{sub.MembershipName}</h3>
                    {sub.Status === 'active' && !sub.CancelAtPeriodEnd && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {t('subscriptions.active')}
                      </span>
                    )}
                    {sub.CancelAtPeriodEnd && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        {t('subscriptions.cancelAtEnd')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm ventic-muted">
                    {t('subscriptions.price')}: ${parseFloat(String(sub.MonthlyPrice)).toFixed(2)}/mes
                  </p>
                  <p className="text-sm ventic-muted mt-1">
                    {t('subscriptions.nextCharge')}:{' '}
                    {new Date(sub.CurrentPeriodEnd).toLocaleDateString(dateLocale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {sub.Status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleOpenPortal(sub.Id, sub.StripeCustomerId)}
                      disabled={redirectingPortal === sub.Id}
                      className="rounded-lg bg-[var(--ventic-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {redirectingPortal === sub.Id ? t('subscriptions.redirecting') : t('subscriptions.manage')}
                    </button>
                  )}
                  {sub.Status === 'active' && !sub.CancelAtPeriodEnd && (
                    <button
                      type="button"
                      onClick={() => handleCancel(sub.Id, sub.StripeSubscriptionId)}
                      disabled={canceling === sub.Id}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300"
                    >
                      {canceling === sub.Id ? t('subscriptions.canceling') : t('subscriptions.cancel')}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
