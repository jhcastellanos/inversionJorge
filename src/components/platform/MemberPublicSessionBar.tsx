'use client';

import Link from 'next/link';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import MemberLogoutButton from './MemberLogoutButton';

export default function MemberPublicSessionBar({ hasAccess }: { hasAccess: boolean }) {
  const { t } = usePlatformPreferences();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Link
        href={hasAccess ? '/app' : '/planes'}
        className="text-sm font-semibold text-[var(--ventic-accent)] hover:underline"
      >
        {hasAccess ? t('nav.home') : t('nav.plans')}
      </Link>
      <MemberLogoutButton />
    </div>
  );
}