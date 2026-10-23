import Link from 'next/link';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import {
  getEventJoinUrl,
  filterEventsByMemberAccess,
  resolveEventTier,
} from '../../../../lib/platformEventDisplay';
import { LIVE_EVENT_TIER_LABELS, PLATFORM_ROLE_LABELS } from '../../../../lib/platformRoles';

function formatRange(starts: Date, ends: Date | null) {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  };
  const s = starts.toLocaleString('es-MX', opts);
  if (!ends) return s;
  return `${s} – ${ends.toLocaleString('es-MX', { timeStyle: 'short' })}`;
}

export default async function CalendarioPage() {
  const { access } = await requireMemberSession();

  if (!access.hasAccess) {
    return (
      <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-bold text-amber-900">Calendario</h1>
        <p className="mt-3 text-amber-800">Necesitas un rol asignado para ver eventos.</p>
        <Link
          href="/onboarding"
          className="inline-block mt-6 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Activar acceso
        </Link>
      </div>
    );
  }

  const allEvents = await PlatformCalendarEvent.findPublishedFromNow();
  const roleLabel = access.effectiveRole ? PLATFORM_ROLE_LABELS[access.effectiveRole] : 'Miembro';

  const visible = filterEventsByMemberAccess(allEvents, access);
  const locked = allEvents.filter((ev) => !visible.some((v) => v.id === ev.id));

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
      <p className="text-gray-600 mt-2">
        Tu acceso ({roleLabel}
        {access.subscriptionActive ? ', membresía activa' : ''}). Los eventos de trading y avanzados requieren
        membresía y rol según el tipo.
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No hay eventos publicados para tu acceso por ahora.
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {visible.map((ev) => {
            const joinUrl = getEventJoinUrl(ev);
            return (
              <li key={ev.id} className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {LIVE_EVENT_TIER_LABELS[resolveEventTier(ev)]}
                  </span>
                  <time className="text-sm text-gray-500">
                    {formatRange(new Date(ev.starts_at), ev.ends_at ? new Date(ev.ends_at) : null)}
                  </time>
                </div>
                <h2 className="font-semibold text-lg text-gray-900 mt-2">{ev.title}</h2>
                {ev.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{ev.description}</p>}
                {joinUrl && (
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Unirse en Zoom ↗
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {locked.length > 0 && (
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-800">Otros eventos (membresía o rol superior)</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {locked.map((ev) => (
              <li key={ev.id} className="flex justify-between gap-4 opacity-75">
                <span>{ev.title}</span>
                <span className="shrink-0 text-slate-500">
                  {LIVE_EVENT_TIER_LABELS[ev.event_tier ?? 'clase_retrospectiva']}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
