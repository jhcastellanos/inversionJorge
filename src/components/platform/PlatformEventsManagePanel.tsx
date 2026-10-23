'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIVE_EVENT_TIER_LABELS, type LiveEventTier } from '../../lib/platformRoles';
import AdminPanelChrome from './admin/AdminPanelChrome';
import { adminPanelShell, adminPrimaryBtn, useAdminPanelTheme } from './admin/AdminPanelTheme';
import {
  formatEventAdminMeta,
  formatEventDayShort,
  getEventJoinUrl,
  type SerializedEvent,
} from '../../lib/platformEventDisplay';
import PlatformEventEditorModal, { type EventEditorPayload } from './PlatformEventEditorModal';

function EventsList({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  const { isDark } = useAdminPanelTheme();
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<SerializedEvent | null>(null);

  const sorted = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
  }, [events]);

  const nextUpcomingId = useMemo(() => {
    const now = Date.now();
    const next = sorted.find((e) => new Date(e.starts_at).getTime() >= now && e.is_published);
    return next?.id ?? sorted.find((e) => new Date(e.starts_at).getTime() >= now)?.id;
  }, [sorted]);

  const reload = async () => {
    const res = await fetch('/api/admin/platform-calendar-events');
    if (!res.ok) {
      setError('No se pudieron cargar eventos');
      return;
    }
    const data = await res.json();
    setEvents(
      (data.events ?? []).map((e: SerializedEvent & { starts_at: string }) => ({
        ...e,
        zoom_url: e.zoom_url ?? null,
        event_kind: e.event_kind ?? 'clase_en_vivo',
      }))
    );
    router.refresh();
  };

  const payloadFromForm = (form: EventEditorPayload) => {
    const starts = new Date(form.starts_at);
    const ends = new Date(starts.getTime() + form.duration_minutes * 60 * 1000);
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      zoom_url: form.zoom_url.trim() || null,
      event_tier: form.event_tier,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      is_published: form.is_published,
    };
  };

  const saveCreate = async (form: EventEditorPayload) => {
    const res = await fetch('/api/admin/platform-calendar-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadFromForm(form)),
    });
    if (!res.ok) throw new Error('Error al crear evento');
    await reload();
  };

  const saveEdit = async (form: EventEditorPayload) => {
    if (!editing) return;
    const res = await fetch(`/api/admin/platform-calendar-events/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadFromForm(form)),
    });
    if (!res.ok) throw new Error('Error al actualizar evento');
    await reload();
  };

  const togglePublished = async (ev: SerializedEvent) => {
    await fetch(`/api/admin/platform-calendar-events/${ev.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !ev.is_published }),
    });
    await reload();
  };

  const markComplete = async (ev: SerializedEvent) => {
    await fetch(`/api/admin/platform-calendar-events/${ev.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_published: false,
        ends_at: ev.ends_at ?? new Date().toISOString(),
      }),
    });
    await reload();
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await fetch(`/api/admin/platform-calendar-events/${id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => {
            setEditorMode('create');
            setEditing(null);
            setEditorOpen(true);
          }}
          className={adminPrimaryBtn(isDark)}
        >
          + Agregar evento
        </button>
      </div>

      {error && (
        <p
          className={`mb-4 text-sm rounded-lg px-4 py-2 ${isDark ? 'text-red-300 bg-red-950/40 border border-red-500/30' : 'text-red-700 bg-red-50 border border-red-200'}`}
        >
          {error}
        </p>
      )}

      <ul className="space-y-4 max-w-4xl">
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 text-sm">
            No hay eventos. Usa &quot;Agregar evento&quot; para crear el primero.
          </li>
        )}
        {sorted.map((ev) => {
          const start = new Date(ev.starts_at);
          const end = ev.ends_at ? new Date(ev.ends_at) : null;
          const { day, month } = formatEventDayShort(start);
          const joinUrl = getEventJoinUrl(ev);
          const isNext = ev.id === nextUpcomingId;
          const tier = ev.event_tier as LiveEventTier;

          return (
            <li key={ev.id}>
              <article className={`${adminPanelShell(isDark)} p-5 sm:p-6`}>
                <div className="flex flex-col lg:flex-row lg:gap-6">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="text-center w-14 shrink-0 pt-1">
                      <div className="text-2xl font-bold text-gray-900 leading-none">{day}</div>
                      <div className="text-[10px] font-bold tracking-wider text-gray-500 mt-1">{month}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isNext && (
                          <span className="text-[10px] font-bold tracking-wide text-blue-900 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
                            PRÓXIMO
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${isDark ? 'text-amber-200 bg-amber-500/15' : 'text-blue-900 bg-blue-50'}`}
                        >
                          {LIVE_EVENT_TIER_LABELS[tier]}
                        </span>
                        {!ev.is_published && (
                          <span className="text-[10px] font-semibold uppercase text-amber-700">Oculto</span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 leading-snug">{ev.title}</h2>
                      {ev.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{ev.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{formatEventAdminMeta(start, end)}</span>
                        {joinUrl && (
                          <a
                            href={joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:underline truncate max-w-full sm:max-w-md"
                          >
                            Zoom ↗
                          </a>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:w-52 shrink-0 flex flex-col gap-3">
                    <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
                      <span>Visible en inicio</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={ev.is_published}
                        onClick={() => togglePublished(ev)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          ev.is_published ? 'bg-blue-700' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            ev.is_published ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditorMode('edit');
                          setEditing(ev);
                          setEditorOpen(true);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => markComplete(ev)}
                        className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        Marcar completado
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ev.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <PlatformEventEditorModal
        open={editorOpen}
        mode={editorMode}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={editorMode === 'create' ? saveCreate : saveEdit}
      />
    </>
  );
}

export default function PlatformEventsManagePanel({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  return (
    <AdminPanelChrome
      title="Gestionar eventos"
      subtitle="Clases/retrospectivas, operativas de trading y sesiones avanzadas con reglas de membresía y rol."
    >
      <EventsList initialEvents={initialEvents} />
    </AdminPanelChrome>
  );
}
