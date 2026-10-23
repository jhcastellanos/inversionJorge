'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AdminTheme = 'dark' | 'light';

const STORAGE_KEY = 'platform-admin-theme';

type Ctx = {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
  toggle: () => void;
  isDark: boolean;
};

const AdminPanelThemeContext = createContext<Ctx | null>(null);

export function AdminPanelThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    if (saved === 'light' || saved === 'dark') setThemeState(saved);
  }, []);

  const setTheme = (t: AdminTheme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <AdminPanelThemeContext.Provider value={{ theme, setTheme, toggle, isDark: theme === 'dark' }}>
      {children}
    </AdminPanelThemeContext.Provider>
  );
}

export function useAdminPanelTheme() {
  const ctx = useContext(AdminPanelThemeContext);
  if (!ctx) throw new Error('useAdminPanelTheme requires AdminPanelThemeProvider');
  return ctx;
}

/** Clases utilitarias para paneles Academy / Eventos */
export function adminPanelShell(isDark: boolean) {
  return isDark
    ? 'rounded-2xl border border-white/10 bg-[#0a0c10] text-white'
    : 'rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm';
}

export function adminStatCard(isDark: boolean) {
  return isDark
    ? 'rounded-xl border border-white/10 bg-[#12151c] px-4 py-3'
    : 'rounded-xl border border-gray-200 bg-slate-50 px-4 py-3';
}

export function adminField(isDark: boolean) {
  return isDark
    ? 'mt-2 w-full rounded-[10px] border border-white/10 bg-[#141820] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-500/40 focus:outline-none'
    : 'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-700 focus:outline-none';
}

export function adminLabel(isDark: boolean) {
  return isDark
    ? 'block text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase'
    : 'block text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase';
}

export function adminPrimaryBtn(isDark: boolean) {
  return isDark
    ? 'inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2.5 text-sm font-bold text-slate-950 hover:from-amber-300 hover:to-amber-500'
    : 'inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800';
}
