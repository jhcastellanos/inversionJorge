'use client';

import { AdminPanelThemeProvider, adminPageWrap, useAdminPanelTheme } from './AdminPanelTheme';
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
        <div className="flex gap-3 min-w-0 flex-1">
          <span className="w-1 self-stretch rounded-full shrink-0 bg-[var(--ventic-accent)]" />
          <div>
            <h1 className="text-3xl font-bold ventic-text">{title}</h1>
            {subtitle && <p className="mt-2 text-sm max-w-2xl ventic-muted">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex flex-col items-end gap-2 shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
