'use client';

import { useRouter } from 'next/navigation';
import { usePlatformPreferences } from './PlatformPreferencesProvider';

const defaultClass =
  'shrink-0 rounded-lg border ventic-border px-3 py-1.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft transition-colors';

export default function MemberLogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = usePlatformPreferences();

  const logout = async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <button type="button" onClick={() => void logout()} className={className ?? defaultClass}>
      {t('nav.logout')}
    </button>
  );
}