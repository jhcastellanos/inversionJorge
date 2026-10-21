'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/app/clases', label: 'Clases y Entrenamientos' },
  { href: '/app/calendario', label: 'Calendario' },
  { href: '/app/membresia', label: 'Mi membresía' },
  { href: '/planes', label: 'Ver planes' },
];

export default function PlatformShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white">
        <div className="p-6 border-b border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-400">Plataforma</p>
          <h1 className="font-bold text-lg leading-tight mt-1">Inversión Real</h1>
          <p className="text-sm text-slate-300 mt-1">Hola, {userName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-700 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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
        <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-semibold">Inversión Real</span>
          <button type="button" onClick={logout} className="text-sm text-slate-300">
            Salir
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
