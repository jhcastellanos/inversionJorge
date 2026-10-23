'use client';

import { usePlatformPreferences } from '../PlatformPreferencesProvider';

export type AdminTheme = 'dark' | 'light';

/** Acento Ventic #208B67 */
export const ADMIN_ACCENT = {
  light: {
    solid: 'bg-[var(--ventic-accent)] hover:bg-[var(--ventic-accent-hover)] text-white',
    soft: 'bg-ventic-accent-soft text-emerald-900 border-emerald-200',
    text: 'text-[var(--ventic-accent)]',
    ring: 'focus:border-[var(--ventic-accent)] focus:ring-[var(--ventic-accent)]/30',
    bar: 'bg-[var(--ventic-accent)]',
  },
  dark: {
    solid: 'bg-gradient-to-b from-emerald-400 to-[var(--ventic-accent)] hover:from-emerald-300 hover:to-[var(--ventic-accent-hover)] text-slate-950',
    soft: 'bg-ventic-accent-soft text-emerald-200 border-emerald-500/30',
    text: 'text-emerald-400',
    ring: 'focus:border-emerald-400/50 focus:ring-emerald-500/30',
    bar: 'bg-emerald-400',
  },
} as const;

export function AdminPanelThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAdminPanelTheme() {
  const { theme, setTheme, toggleTheme, isDark } = usePlatformPreferences();
  return {
    theme: theme as AdminTheme,
    setTheme,
    toggle: toggleTheme,
    isDark,
  };
}

function accent(isDark: boolean) {
  return isDark ? ADMIN_ACCENT.dark : ADMIN_ACCENT.light;
}

export function adminPageWrap(isDark: boolean) {
  return isDark
    ? 'rounded-2xl border ventic-border ventic-surface p-4 sm:p-6'
    : 'rounded-2xl border ventic-border ventic-surface p-4 sm:p-6 shadow-sm ring-1 ring-[var(--ventic-accent)]/5';
}

export function adminPanelShell(isDark: boolean) {
  return `rounded-2xl border ventic-border ventic-surface ventic-text ${isDark ? '' : 'shadow-sm'}`;
}

export function adminStatCard(isDark: boolean) {
  return `rounded-xl border ventic-border px-4 py-3 ${isDark ? 'bg-[var(--ventic-surface-elevated)]' : 'ventic-surface'}`;
}

export function adminStatValue(isDark: boolean) {
  return isDark ? 'text-emerald-400' : 'text-[var(--ventic-accent)]';
}

export function adminField(isDark: boolean) {
  const a = accent(isDark);
  return `mt-2 w-full rounded-[10px] border ventic-border bg-[var(--ventic-bg)] px-3.5 py-2.5 text-sm ventic-text placeholder:opacity-50 focus:outline-none focus:ring-1 ${a.ring}`;
}

export function adminLabel(isDark: boolean) {
  return isDark
    ? 'block text-[11px] font-semibold tracking-[0.12em] text-emerald-200/70 uppercase'
    : 'block text-[11px] font-semibold tracking-[0.12em] text-[var(--ventic-accent)] uppercase';
}

export function adminPrimaryBtn(isDark: boolean) {
  return `inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-bold shadow-sm ${accent(isDark).solid}`;
}

export function adminGhostBtn(isDark: boolean) {
  return isDark
    ? 'inline-flex items-center gap-2 rounded-[10px] border ventic-border px-4 py-2.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft'
    : 'inline-flex items-center gap-2 rounded-lg border ventic-border px-4 py-2.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft';
}

export function adminThemeToggleBtn(isDark: boolean) {
  return 'text-xs font-medium rounded-lg border ventic-border px-3 py-1.5 ventic-text hover:bg-ventic-accent-soft';
}

export function adminBadge(isDark: boolean) {
  return isDark
    ? 'text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-ventic-accent-soft text-emerald-200'
    : 'text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-ventic-accent-soft text-emerald-900 border border-emerald-200/80';
}

export function adminLinkAccent(isDark: boolean) {
  return isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-[var(--ventic-accent)] hover:opacity-90';
}

export function adminToggleTrack(on: boolean, isDark: boolean) {
  if (on) return 'bg-[var(--ventic-accent)]';
  return isDark ? 'bg-slate-600' : 'bg-gray-300';
}

export function adminLessonPanel(isDark: boolean) {
  return `mt-4 rounded-xl border ventic-border p-4 ${isDark ? 'bg-[var(--ventic-surface-elevated)]' : 'bg-ventic-accent-soft/50'}`;
}

export function adminModalBackdrop() {
  return 'absolute inset-0 bg-black/60 backdrop-blur-sm';
}

export function adminModalShell(isDark: boolean) {
  return `relative w-full max-w-xl rounded-2xl border ventic-border ventic-surface ventic-text shadow-2xl overflow-hidden ${isDark ? 'shadow-black/40' : ''}`;
}

export function adminModalHeader(isDark: boolean) {
  return isDark
    ? 'border-b ventic-border px-6 py-5 bg-[var(--ventic-surface-elevated)]'
    : 'border-b ventic-border px-6 py-5 bg-ventic-accent-soft/40';
}
