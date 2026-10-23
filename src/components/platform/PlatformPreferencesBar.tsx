'use client';

import { usePlatformPreferences, type PlatformTheme } from './PlatformPreferencesProvider';
import type { Locale } from '../../lib/i18n';
import { getMessages } from '../../lib/i18n';

export default function PlatformPreferencesBar({ userName }: { userName?: string }) {
  const { theme, locale, toggleTheme, setLocale, t, isDark } = usePlatformPreferences();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <label className="flex items-center gap-1.5 text-xs ventic-muted">
        <span className="hidden sm:inline">{t('shell.language')}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="rounded-lg border ventic-border bg-[var(--ventic-surface)] px-2 py-1.5 text-xs ventic-text focus:outline-none focus:ring-2 focus:ring-[var(--ventic-accent)]/40"
          aria-label={t('shell.language')}
        >
          <option value="es">{getMessages('es').localeName}</option>
          <option value="en">{getMessages('en').localeName}</option>
        </select>
      </label>

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg border ventic-border bg-[var(--ventic-surface)] px-3 py-1.5 text-xs font-medium ventic-text hover:bg-[var(--ventic-accent-soft)] transition-colors"
        title={isDark ? t('shell.themeLight') : t('shell.themeDark')}
      >
        {isDark ? '☀️' : '🌙'}{' '}
        <span className="hidden sm:inline">{isDark ? t('shell.themeLight') : t('shell.themeDark')}</span>
      </button>

      {userName && (
        <div className="hidden lg:flex flex-col items-end text-right pl-2 border-l ventic-border ml-1">
          <span className="text-sm font-semibold ventic-text">{userName}</span>
          <span className="text-[10px] uppercase tracking-wide ventic-muted">{t('shell.platform')}</span>
        </div>
      )}
    </div>
  );
}

export function syncLegacyAdminTheme(theme: PlatformTheme) {
  try {
    localStorage.setItem('platform-admin-theme', theme);
  } catch {
    /* ignore */
  }
}
