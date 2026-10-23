'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AdminTheme = 'dark' | 'light';

const STORAGE_KEY = 'platform-admin-theme';

/** Acento tipo Ventic (~ #20AD79) */
export const ADMIN_ACCENT = {
  light: {
    solid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    soft: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
    ring: 'focus:border-emerald-500 focus:ring-emerald-500/30',
    bar: 'bg-emerald-500',
  },
  dark: {
    solid: 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950',
    soft: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
    text: 'text-emerald-400',
    ring: 'focus:border-emerald-400/50 focus:ring-emerald-500/30',
    bar: 'bg-emerald-400',
  },
} as const;

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

function accent(isDark: boolean) {
  return isDark ? ADMIN_ACCENT.dark : ADMIN_ACCENT.light;
}

export function adminPageWrap(isDark: boolean) {
  return isDark
    ? 'rounded-2xl border border-white/5 bg-[#0b0e14] p-4 sm:p-6 -mx-2 sm:mx-0'
    : 'rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white p-4 sm:p-6 shadow-sm';
}

export function adminPanelShell(isDark: boolean) {
  return isDark
    ? 'rounded-2xl border border-white/10 bg-[#121820] text-white'
    : 'rounded-2xl border border-gray-200/80 bg-white text-gray-900 shadow-sm ring-1 ring-emerald-500/5';
}

export function adminStatCard(isDark: boolean) {
  return isDark
    ? 'rounded-xl border border-emerald-500/10 bg-[#141c18] px-4 py-3'
    : 'rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm';
}

export function adminStatValue(isDark: boolean) {
  return isDark ? 'text-emerald-300' : 'text-emerald-700';
}

export function adminField(isDark: boolean) {
  const a = accent(isDark);
  return isDark
    ? `mt-2 w-full rounded-[10px] border border-white/10 bg-[#141820] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 ${a.ring}`
    : `mt-2 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 ${a.ring}`;
}

export function adminLabel(isDark: boolean) {
  return isDark
    ? 'block text-[11px] font-semibold tracking-[0.12em] text-emerald-200/70 uppercase'
    : 'block text-[11px] font-semibold tracking-[0.12em] text-emerald-800/80 uppercase';
}

export function adminPrimaryBtn(isDark: boolean) {
  return `inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-bold shadow-sm ${accent(isDark).solid}`;
}

export function adminGhostBtn(isDark: boolean) {
  return isDark
    ? 'inline-flex items-center gap-2 rounded-[10px] border border-white/20 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5'
    : 'inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50';
}

export function adminThemeToggleBtn(isDark: boolean) {
  return isDark
    ? 'text-xs font-medium rounded-lg border border-emerald-500/25 px-3 py-1.5 text-emerald-200 hover:bg-emerald-500/10'
    : 'text-xs font-medium rounded-lg border border-emerald-200 px-3 py-1.5 text-emerald-800 hover:bg-emerald-50';
}

export function adminBadge(isDark: boolean) {
  return isDark
    ? 'text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
    : 'text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100';
}

export function adminLinkAccent(isDark: boolean) {
  return isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800';
}

export function adminToggleTrack(on: boolean, isDark: boolean) {
  if (on) return isDark ? 'bg-emerald-500' : 'bg-emerald-600';
  return isDark ? 'bg-slate-600' : 'bg-gray-300';
}

export function adminLessonPanel(isDark: boolean) {
  return isDark
    ? 'mt-4 rounded-xl border border-emerald-500/20 bg-[#141820] p-4'
    : 'mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4';
}

export function adminModalBackdrop() {
  return 'absolute inset-0 bg-black/60 backdrop-blur-sm';
}

export function adminModalShell(isDark: boolean) {
  return isDark
    ? 'relative w-full max-w-xl rounded-2xl border border-emerald-500/15 bg-[#0a0e12] shadow-2xl shadow-emerald-950/20 text-white overflow-hidden'
    : 'relative w-full max-w-xl rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/5 text-gray-900 overflow-hidden';
}

export function adminModalHeader(isDark: boolean) {
  return isDark
    ? 'border-b border-emerald-500/10 px-6 py-5 bg-[#0d1218]'
    : 'border-b border-emerald-100 px-6 py-5 bg-emerald-50/60';
}
