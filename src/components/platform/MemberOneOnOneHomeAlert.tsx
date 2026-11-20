'use client';

import Link from 'next/link';
import { usePlatformPreferences } from './PlatformPreferencesProvider';

export default function MemberOneOnOneHomeAlert({ count }: { count: number }) {
  const { t } = usePlatformPreferences();
  if (count <= 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-[var(--ventic-accent)]/40 bg-ventic-accent-soft/40 px-5 py-4">
      <p className="text-sm font-bold ventic-text">{t('home.oneOnOneActionTitle')}</p>
      <p className="text-sm ventic-muted mt-1">
        {t('home.oneOnOneActionBody').replace('{count}', String(count))}
      </p>
      <Link
        href="/reunion-1a1"
        className="inline-block mt-3 text-sm font-semibold text-[var(--ventic-accent)] hover:underline"
      >
        {t('home.oneOnOneActionLink')}
      </Link>
    </section>
  );
}