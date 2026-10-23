'use client';

import { AdminPanelThemeProvider, useAdminPanelTheme } from './AdminPanelTheme';

function ThemeToggle() {
  const { theme, toggle } = useAdminPanelTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs font-medium rounded-lg border px-3 py-1.5 border-white/15 text-slate-300 hover:bg-white/5 dark:border-white/15 dark:text-slate-300 light:border-gray-300 light:text-gray-600"
      title="Cambiar tema del panel"
    >
      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}

export default function AdminPanelChrome({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <AdminPanelThemeProvider>
      <AdminPanelChromeInner title={title} subtitle={subtitle} action={action}>
        {children}
      </AdminPanelChromeInner>
    </AdminPanelThemeProvider>
  );
}

function AdminPanelChromeInner({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const { isDark } = useAdminPanelTheme();
  return (
    <div className={isDark ? 'text-white' : 'text-gray-900'}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {subtitle && (
            <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}
