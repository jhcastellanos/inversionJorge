'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/app', label: 'Inicio' },
  { href: '/app/clases', label: 'Clases y Entrenamientos' },
  { href: '/app/calendario', label: 'Calendario' },
  { href: '/app/membresia', label: 'Mi membresía' },
  { href: '/planes', label: 'Ver planes' },
];

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
          ? 'border-amber-200/30 bg-gradient-to-b from-slate-800 to-slate-900 text-amber-50 shadow-inner'
          : 'border-transparent text-slate-200 hover:bg-slate-800 hover:border-white/10'
      }`}
    >
      {active && (
        <span className="absolute left-1.5 top-2 bottom-2 w-1 rounded-full bg-amber-400" />
      )}
      <span className={`shrink-0 pl-1 ${active ? 'text-amber-400' : 'text-slate-400'}`}>{icon}</span>
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
  const homeFullBleed = pathname === '/app';
  const router = useRouter();
  const adminEventsActive = pathname === '/app/gestionar-eventos';
  const academyActive = pathname === '/app/academy-manager';

  const logout = async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const navLinkClass = (href: string) => {
    const active = pathname === href;
    return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-blue-700 text-white' : 'text-slate-200 hover:bg-slate-800'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shrink-0">
        <div className="p-6 border-b border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-400">Plataforma</p>
          <h1 className="font-bold text-lg leading-tight mt-1">Inversión Real</h1>
          <p className="text-sm text-slate-300 mt-1">Hola, {userName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}

          {showAdminNav && (
            <div className="pt-4 mt-4 border-t border-slate-700">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Admin
              </p>
              <div className="space-y-1.5">
                <AdminNavLink
                  href="/app/academy-manager"
                  active={academyActive}
                  label="Academy Manager"
                  icon={<BookIcon className="w-4 h-4" />}
                />
                <AdminNavLink
                  href="/app/gestionar-eventos"
                  active={adminEventsActive}
                  label="Gestionar eventos"
                  icon={<ShieldIcon className="w-4 h-4" />}
                />
              </div>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex flex-wrap justify-between items-center gap-2">
          <span className="font-semibold">Inversión Real</span>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {showAdminNav && (
              <>
                <Link
                  href="/app/academy-manager"
                  className={academyActive ? 'text-amber-300 font-semibold' : 'text-slate-300'}
                >
                  Academy
                </Link>
                <Link
                  href="/app/gestionar-eventos"
                  className={adminEventsActive ? 'text-amber-300 font-semibold' : 'text-slate-300'}
                >
                  Eventos
                </Link>
              </>
            )}
            <button type="button" onClick={logout} className="text-slate-300">
              Salir
            </button>
          </div>
        </header>
        <main
          className={`flex-1 min-w-0 ${homeFullBleed ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
