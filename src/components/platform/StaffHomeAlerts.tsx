'use client';

import Link from 'next/link';
import type { StaffAlertCounts } from '../../lib/staffAlertCounts';
import { usePlatformPreferences } from './PlatformPreferencesProvider';

export default function StaffHomeAlerts({ counts }: { counts: StaffAlertCounts }) {
  const { t } = usePlatformPreferences();
  const total = counts.openSupportTickets + counts.pendingOneOnOne;
  if (total === 0) return null;

  return (
    <section
      className="mb-8 rounded-2xl border border-amber-400/45 bg-amber-500/10 px-5 py-4"
      aria-label={t('home.staffAlertsTitle')}
    >
      <h2 className="text-sm font-bold ventic-text">{t('home.staffAlertsTitle')}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {counts.openSupportTickets > 0 && (
          <li>
            <Link
              href="/admin/support-tickets"
              className="font-semibold text-[var(--ventic-accent)] hover:underline"
            >
              {t('home.staffSupportPending').replace('{count}', String(counts.openSupportTickets))}
            </Link>
          </li>
        )}
        {counts.pendingOneOnOne > 0 && (
          <li>
            <Link
              href="/admin/reuniones-1a1"
              className="font-semibold text-[var(--ventic-accent)] hover:underline"
            >
              {t('home.staffOneOnOnePending').replace('{count}', String(counts.pendingOneOnOne))}
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}