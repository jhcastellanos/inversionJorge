'use client';

import Link from 'next/link';
import ContactSupportRoleBanner from './ContactSupportRoleBanner';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import {
  formatEventDayShort,
  formatEventLine,
  getEventJoinUrl,
  greetingForNow,
  headerDateLine,
  type SerializedEvent,
} from '../../lib/platformEventDisplay';
import { LIVE_EVENT_TIER_LABELS } from '../../lib/platformRoles';

type Props = {
  user: { full_name: string; email: string };
  contactSupportForRoleUpgrade?: boolean;
  live: SerializedEvent[];
  upcoming: SerializedEvent[];
};

export default function PlatformHomeHub({
  user,
  contactSupportForRoleUpgrade,
  live,
  upcoming,
}: Props) {
  const { t } = usePlatformPreferences();
  const hero = live[0] ?? upcoming[0] ?? null;
  const heroIsLive = hero ? live.some((e) => e.id === hero.id) : false;
  const displayName = user.full_name.split(' ')[0];
  const listEvents = heroIsLive ? upcoming : upcoming.filter((e) => !hero || e.id !== hero.id);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.2em] ventic-muted font-medium uppercase">{headerDateLine()}</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-3 leading-snug ventic-text">
          {greetingForNow()},{' '}
          <span className="text-[var(--ventic-accent)]">{displayName}</span>.
        </h1>
      </header>

      {contactSupportForRoleUpgrade && (
        <div className="mb-6">
          <ContactSupportRoleBanner />
        </div>
      )}

      {hero ? (
        <article className="rounded-2xl border ventic-border ventic-surface p-6 sm:p-8 shadow-sm">
          {heroIsLive ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              EN VIVO
            </span>
          ) : (
            <span className="inline-flex rounded-md bg-ventic-accent-soft border border-[var(--ventic-accent)]/30 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--ventic-accent)]">
              PRÓXIMO
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 leading-tight ventic-text">{hero.title}</h2>
          <p className="ventic-muted text-sm mt-2">{formatEventLine(new Date(hero.starts_at))}</p>
          <p className="text-xs text-[var(--ventic-accent-muted)] mt-1">
            {LIVE_EVENT_TIER_LABELS[hero.event_tier]}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/app/clases"
              className="inline-flex items-center gap-2 rounded-lg border ventic-border px-4 py-2.5 text-sm font-medium ventic-text hover:bg-ventic-accent-soft"
            >
              {t('nav.classes')}
            </Link>
            {getEventJoinUrl(hero) ? (
              <a
                href={getEventJoinUrl(hero)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--ventic-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)]"
              >
                Unirse ↗
              </a>
            ) : (
              <Link
                href="/app/calendario"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--ventic-accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--ventic-accent-hover)]"
              >
                {t('nav.calendar')}
              </Link>
            )}
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed ventic-border ventic-surface p-10 text-center ventic-muted">
          No hay eventos en vivo ni próximos. Revisa el calendario más adelante.
        </div>
      )}

      <section className="mt-10">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--ventic-accent-muted)] mb-4">
          PRÓXIMOS EVENTOS
        </h3>
        {listEvents.length === 0 ? (
          <p className="text-sm ventic-muted py-4 border-t ventic-border">Sin más eventos programados.</p>
        ) : (
          <ul className="divide-y ventic-border border-t ventic-border">
            {listEvents.map((ev) => {
              const d = new Date(ev.starts_at);
              const { day, month } = formatEventDayShort(d);
              const external = getEventJoinUrl(ev);
              return (
                <li key={ev.id} className="flex gap-4 py-5 items-start">
                  <div className="text-center w-12 shrink-0 ventic-muted">
                    <div className="text-lg font-bold ventic-text leading-none">{day}</div>
                    <div className="text-[10px] font-bold tracking-wider">{month}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold ventic-text leading-snug">{ev.title}</p>
                    <p className="text-sm ventic-muted mt-1">{formatEventLine(d)}</p>
                  </div>
                  {external ? (
                    <a
                      href={external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border ventic-border px-3 py-2 text-xs font-medium ventic-text hover:bg-ventic-accent-soft"
                    >
                      Detalles ↗
                    </a>
                  ) : (
                    <Link
                      href="/app/calendario"
                      className="shrink-0 rounded-lg border ventic-border px-3 py-2 text-xs font-medium ventic-text hover:bg-ventic-accent-soft"
                    >
                      Calendario
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
