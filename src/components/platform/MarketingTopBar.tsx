'use client';

import Link from 'next/link';
import PlatformPreferencesBar from './PlatformPreferencesBar';

type Props = {
  ctaHref?: string;
  ctaLabel?: string;
};

export default function MarketingTopBar({
  ctaHref = '/planes',
  ctaLabel = 'Ver planes',
}: Props) {
  return (
    <nav className="ventic-surface border-b ventic-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3">
        <Link href="/" className="block">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ventic-accent-muted)]">Plataforma CRM</p>
          <h1 className="text-xl sm:text-2xl font-bold ventic-text">Inversión Real con Jorge y Guille</h1>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <PlatformPreferencesBar />
          <Link
            href={ctaHref}
            className="px-3 sm:px-4 py-2 rounded-lg bg-[var(--ventic-accent)] text-white text-sm font-semibold hover:bg-[var(--ventic-accent-hover)]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
