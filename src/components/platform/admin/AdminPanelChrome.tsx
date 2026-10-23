'use client';

import {
  AdminPanelThemeProvider,
  adminPageWrap,
  adminThemeToggleBtn,
  useAdminPanelTheme,
} from './AdminPanelTheme';

function ThemeToggle() {
  const { theme, toggle, isDark } = useAdminPanelTheme();
  return (
    <button type="button" onClick={toggle} className={adminThemeToggleBtn(isDark)} title="Cambiar tema del panel">
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
    <div className={adminPageWrap(isDark)}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex gap-3 min-w-0">
          <span className={`w-1 self-stretch rounded-full shrink-0 ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
            {subtitle && (
              <p className={`mt-2 text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
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
