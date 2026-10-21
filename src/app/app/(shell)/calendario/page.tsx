import Link from 'next/link';
import { requireMemberSession } from '../../../../lib/getCurrentMember';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import {
  EVENT_LEVEL_LABELS,
  PLATFORM_ROLE_LABELS,
  type EventLevel,
} from '../../../../lib/platformRoles';

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
        <p className="mt-3 text-amber-800">Necesitas membresía activa o un rol asignado para ver eventos.</p>
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

  const visible = allEvents.filter((ev) => access.contentAccess.events[ev.event_level as EventLevel]);
  const locked = allEvents.filter((ev) => !access.contentAccess.events[ev.event_level as EventLevel]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
      <p className="text-gray-600 mt-2">
        Tu nivel de acceso ({roleLabel}) incluye:{' '}
        {(Object.keys(EVENT_LEVEL_LABELS) as EventLevel[])
          .filter((k) => access.contentAccess.events[k])
          .map((k) => EVENT_LEVEL_LABELS[k])
          .join(', ') || 'ningún tipo de evento'}
        .
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No hay eventos publicados en tu nivel por ahora.
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {visible.map((ev) => (
            <li key={ev.id} className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {EVENT_LEVEL_LABELS[ev.event_level]}
                </span>
                <time className="text-sm text-gray-500">{formatRange(new Date(ev.starts_at), ev.ends_at ? new Date(ev.ends_at) : null)}</time>
              </div>
              <h2 className="font-semibold text-lg text-gray-900 mt-2">{ev.title}</h2>
              {ev.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{ev.description}</p>}
            </li>
          ))}
        </ul>
      )}

      {locked.length > 0 && (
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-800">Eventos con otro nivel de acceso</h3>
          <p className="text-sm text-slate-600 mt-1">
            Estos eventos existen en el calendario pero requieren un rol superior (Trader o Inversor).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {locked.map((ev) => (
              <li key={ev.id} className="flex justify-between gap-4 opacity-75">
                <span>{ev.title}</span>
                <span className="shrink-0 text-slate-500">{EVENT_LEVEL_LABELS[ev.event_level]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
