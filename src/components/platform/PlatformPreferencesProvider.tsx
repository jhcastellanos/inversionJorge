'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate, type Locale } from '../../lib/i18n';

export type PlatformTheme = 'light' | 'dark';

const THEME_KEY = 'platform-theme';
const LOCALE_KEY = 'platform-locale';

type Ctx = {
  theme: PlatformTheme;
  locale: Locale;
  isDark: boolean;
  setTheme: (t: PlatformTheme) => void;
  toggleTheme: () => void;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const PlatformPreferencesContext = createContext<Ctx | null>(null);

function applyDocument(theme: PlatformTheme, locale: Locale) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.lang = locale;
  try {
    localStorage.setItem('platform-admin-theme', theme);
  } catch {
    /* ignore */
  }
}

export function PlatformPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PlatformTheme>('light');
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as PlatformTheme | null;
    const legacyAdmin = localStorage.getItem('platform-admin-theme') as PlatformTheme | null;
    const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale | null;
    const t =
      savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : legacyAdmin === 'dark' || legacyAdmin === 'light'
          ? legacyAdmin
          : 'light';
    const l = savedLocale === 'en' || savedLocale === 'es' ? savedLocale : 'es';
    setThemeState(t);
    setLocaleState(l);
    applyDocument(t, l);
  }, []);

  const setTheme = useCallback(
    (t: PlatformTheme) => {
      setThemeState(t);
      localStorage.setItem(THEME_KEY, t);
      applyDocument(t, locale);
    },
    [locale]
  );

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      localStorage.setItem(LOCALE_KEY, l);
      applyDocument(theme, l);
    },
    [theme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo(
    () => ({
      theme,
      locale,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
      setLocale,
      t,
    }),
    [theme, locale, setTheme, toggleTheme, setLocale, t]
  );

  return (
    <PlatformPreferencesContext.Provider value={value}>{children}</PlatformPreferencesContext.Provider>
  );
}

export function usePlatformPreferences() {
  const ctx = useContext(PlatformPreferencesContext);
  if (!ctx) throw new Error('usePlatformPreferences requires PlatformPreferencesProvider');
  return ctx;
}
