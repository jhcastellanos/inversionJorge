'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MemberAuthForm from './MemberAuthForm';
import PlatformHomeAdminSection from './PlatformHomeAdminSection';
import {
  formatEventDayShort,
  formatEventLine,
  greetingForNow,
  headerDateLine,
  type SerializedEvent,
} from '../../lib/platformEventDisplay';
import type { EventLevel } from '../../lib/platformRoles';
import { EVENT_LEVEL_LABELS } from '../../lib/platformRoles';

type Props = {
  user: { full_name: string; email: string } | null;
  hasAccess: boolean;
  isPlatformAdmin: boolean;
  live: SerializedEvent[];
  upcoming: SerializedEvent[];
  adminEvents: SerializedEvent[];
  authMode: 'login' | 'register';
};

function joinHref(ev: SerializedEvent) {
  if (ev.description?.startsWith('http')) return ev.description.trim().split(/\s/)[0];
  return null;
}

export default function PlatformHomeHub({
  user,
  hasAccess,
  isPlatformAdmin,
  live,
  upcoming,
  adminEvents,
  authMode,
}: Props) {
  const router = useRouter();
  const hero = live[0] ?? upcoming[0] ?? null;
  const heroIsLive = hero ? live.some((e) => e.id === hero.id) : false;

  const logout = async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white">
        <header className="max-w-3xl mx-auto px-4 py-8 flex justify-between items-start">
          <div>
            <p className="text-xs tracking-[0.25em] text-slate-500">{headerDateLine()}</p>
            <h1 className="text-3xl font-bold mt-2">Inversión Real con Jorge y Guille</h1>
            <p className="text-slate-400 mt-2 text-sm">Inicia sesión para ver clases en vivo y el calendario.</p>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 pb-16">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl">
            <div className="flex gap-2 mb-6">
              <Link
                href="/"
                className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold ${authMode === 'login' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                Entrar
              </Link>
              <Link
                href="/?register=1"
                className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold ${authMode === 'register' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                Crear cuenta
              </Link>
            </div>
            <MemberAuthForm mode={authMode} variant="dark" />
          </div>
          <p className="text-center mt-6 text-sm text-slate-500">
            <Link href="/planes" className="text-amber-400/90 hover:underline">
              Ver membresías
            </Link>
          </p>
        </main>
      </div>
    );
  }

  const displayName = user.full_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-4 flex justify-between items-start gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-slate-500 font-medium">{headerDateLine()}</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3 leading-snug">
            {greetingForNow()},{' '}
            <span className="text-amber-400">{displayName}</span>.
          </h1>
        </div>
        <nav className="flex flex-col items-end gap-2 text-sm shrink-0">
          <Link href="/app/clases" className="text-slate-300 hover:text-white">
            Academia
          </Link>
          <Link href="/app/membresia" className="text-slate-300 hover:text-white">
            Membresía
          </Link>
          <button type="button" onClick={logout} className="text-slate-500 hover:text-white">
            Salir
          </button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-20">
        {hero && (
          <article className="mt-6 rounded-2xl overflow-hidden border border-slate-700/80 bg-gradient-to-br from-slate-800/90 via-slate-900 to-slate-950 p-6 sm:p-8 relative">
            {heroIsLive && (
              <span className="inline-flex items-center gap-2 rounded-md bg-red-600/90 px-2.5 py-1 text-[11px] font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE NOW
              </span>
            )}
            {!heroIsLive && (
              <span className="inline-flex rounded-md bg-slate-700 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-200">
                PRÓXIMO
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 leading-tight">{hero.title}</h2>
            <p className="text-slate-400 text-sm mt-2">{formatEventLine(new Date(hero.starts_at))}</p>
            <p className="text-xs text-slate-500 mt-1">{EVENT_LEVEL_LABELS[hero.event_level as EventLevel]}</p>
            <div className="flex flex-wrap gap-3 mt-8 justify-end">
              <Link
                href="/app/clases"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
              >
                Go to Academy
              </Link>
              {joinHref(hero) ? (
                <a
                  href={joinHref(hero)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-slate-950 px-5 py-2.5 text-sm font-bold hover:bg-amber-400"
                >
                  Join Class ↗
                </a>
              ) : (
                <Link
                  href="/app/calendario"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-slate-950 px-5 py-2.5 text-sm font-bold hover:bg-amber-400"
                >
                  Join Class
                </Link>
              )}
            </div>
          </article>
        )}

        {!hero && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
            No hay eventos en vivo ni próximos. Revisa el calendario más adelante.
          </div>
        )}

        <section className="mt-10">
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 mb-4">PRÓXIMOS EVENTOS</h3>
          <ul className="divide-y divide-slate-800 border-t border-slate-800">
            {(heroIsLive ? upcoming : upcoming.filter((e) => !hero || e.id !== hero.id)).map((ev) => {
              const d = new Date(ev.starts_at);
              const { day, month } = formatEventDayShort(d);
              const external = joinHref(ev);
              return (
                <li key={ev.id} className="flex gap-4 py-5 items-start">
                  <div className="text-center w-12 shrink-0 text-slate-400">
                    <div className="text-lg font-bold text-white leading-none">{day}</div>
                    <div className="text-[10px] font-bold tracking-wider">{month}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white leading-snug">{ev.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{formatEventLine(d)}</p>
                  </div>
                  {external ? (
                    <a
                      href={external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      View Details ↗
                    </a>
                  ) : (
                    <Link
                      href="/app/calendario"
                      className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      View Details
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {isPlatformAdmin && <PlatformHomeAdminSection initialEvents={adminEvents} />}
      </main>
    </div>
  );
}
