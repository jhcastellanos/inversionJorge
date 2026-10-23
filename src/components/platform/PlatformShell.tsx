'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import PlatformPreferencesBar from './PlatformPreferencesBar';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v17H7.5A2.5 2.5 0 0 0 5 22.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5 5.5A2.5 2.5 0 0 0 7.5 3H18v2H7.5A2.5 2.5 0 0 0 5 5.5Z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function AdminNavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 rounded-full border pl-3 pr-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-[var(--ventic-accent)]/40 bg-ventic-accent-soft ventic-text shadow-sm'
          : 'border-transparent ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
      }`}
    >
      {active && <span className="absolute left-1.5 top-2 bottom-2 w-1 rounded-full bg-[var(--ventic-accent)]" />}
      <span className={`shrink-0 pl-1 ${active ? 'text-[var(--ventic-accent-muted)]' : ''}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function PlatformShell({
  children,
  userName,
  showAdminNav,
}: {
  children: React.ReactNode;
  userName: string;
  showAdminNav?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = usePlatformPreferences();
  const adminEventsActive = pathname === '/app/gestionar-eventos';
  const academyActive = pathname === '/app/academy-manager';

  const navItems = [
    { href: '/app', label: t('nav.home') },
    { href: '/app/clases', label: t('nav.classes') },
    { href: '/app/calendario', label: t('nav.calendar') },
    { href: '/app/membresia', label: t('nav.membership') },
    { href: '/app/planes', label: t('nav.plans') },
  ];

  const logout = async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const navLinkClass = (href: string) => {
    const active = pathname === href;
    return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--ventic-accent)] text-white'
        : 'ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
    }`;
  };

  const logoutButtonClass =
    'shrink-0 rounded-lg border ventic-border px-3 py-1.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft transition-colors';

  return (
    <div className="min-h-screen ventic-bg flex ventic-text">
      <aside className="hidden md:flex w-64 flex-col border-r ventic-border ventic-surface shrink-0 h-screen sticky top-0">
        <div className="p-6 border-b ventic-border">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ventic-accent)] text-white font-bold">
              IR
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide ventic-muted">{t('shell.platform')}</p>
              <h1 className="font-bold text-base leading-tight">{t('shell.brand')}</h1>
            </div>
          </div>
          <p className="text-sm ventic-muted mt-3">
            {t('shell.hello')}, {userName}
          </p>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}

          {showAdminNav && (
            <div className="pt-4 mt-4 border-t ventic-border">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider ventic-muted">
                {t('nav.admin')}
              </p>
              <div className="space-y-1.5">
                <AdminNavLink
                  href="/app/academy-manager"
                  active={academyActive}
                  label={t('nav.academyManager')}
                  icon={<BookIcon className="w-4 h-4" />}
                />
                <AdminNavLink
                  href="/app/gestionar-eventos"
                  active={adminEventsActive}
                  label={t('nav.manageEvents')}
                  icon={<ShieldIcon className="w-4 h-4" />}
                />
              </div>
            </div>
          )}
        </nav>
        <div className="p-4 border-t ventic-border shrink-0 ventic-surface">
          <button type="button" onClick={logout} className={`w-full ${logoutButtonClass}`}>
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between gap-4 px-6 py-3 border-b ventic-border ventic-surface sticky top-0 z-20">
          <p className="text-sm font-medium ventic-muted">{t('shell.platform')}</p>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <PlatformPreferencesBar userName={userName} />
            <button type="button" onClick={logout} className={logoutButtonClass}>
              {t('nav.logout')}
            </button>
          </div>
        </header>

        <header className="md:hidden ventic-surface border-b ventic-border px-4 py-3 sticky top-0 z-20">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="font-semibold ventic-text">{t('shell.brand')}</span>
            <button type="button" onClick={logout} className={logoutButtonClass}>
              {t('nav.logout')}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PlatformPreferencesBar />
            {showAdminNav && (
              <>
                <Link
                  href="/app/academy-manager"
                  className={academyActive ? 'text-ventic-accent text-sm font-semibold' : 'ventic-muted text-sm'}
                >
                  Academy
                </Link>
                <Link
                  href="/app/gestionar-eventos"
                  className={adminEventsActive ? 'text-ventic-accent text-sm font-semibold' : 'ventic-muted text-sm'}
                >
                  Events
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 min-w-0 ventic-bg p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
