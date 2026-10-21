'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EVENT_LEVEL_LABELS,
  type EventLevel,
} from '../../lib/platformRoles';
import {
  formatEventAdminMeta,
  formatEventDayShort,
  getEventJoinUrl,
  type SerializedEvent,
} from '../../lib/platformEventDisplay';
import PlatformEventEditorModal, { type EventEditorPayload } from './PlatformEventEditorModal';

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

export default function PlatformHomeAdminSection({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
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
      }))
    );
    router.refresh();
  };

  const payloadFromForm = (form: EventEditorPayload) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    zoom_url: form.zoom_url.trim() || null,
    event_level: form.event_level,
    starts_at: new Date(form.starts_at).toISOString(),
    ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    is_published: form.is_published,
  });

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

  const openCreate = () => {
    setEditorMode('create');
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (ev: SerializedEvent) => {
    setEditorMode('edit');
    setEditing(ev);
    setEditorOpen(true);
  };

  return (
    <>
      <section className="mt-10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
            open
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
              : 'border-white/15 bg-[#12151c]/80 text-slate-200 hover:border-amber-500/25 hover:bg-[#12151c]'
          }`}
        >
          <span
            className={`w-1 self-stretch min-h-[2rem] rounded-full shrink-0 ${
              open ? 'bg-amber-400' : 'bg-amber-500/50'
            }`}
          />
          <ShieldIcon className="w-5 h-5 shrink-0 text-amber-400" />
          <span className="flex-1 font-semibold text-sm sm:text-base">Admin — gestionar eventos del inicio</span>
          <span className="text-amber-400/80 text-xs">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-[#0a0c10] overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Trading Academy Schedule</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Clases en vivo — edita, publica y enlaza Zoom. Cada tipo de evento filtra por rol.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 shrink-0"
              >
                <span className="text-lg leading-none">+</span> Agregar clase
              </button>
            </div>

            {error && <p className="px-6 py-3 text-sm text-red-400">{error}</p>}

            <ul className="divide-y divide-white/5">
              {sorted.length === 0 && (
                <li className="px-6 py-12 text-center text-slate-500 text-sm">
                  No hay eventos. Usa &quot;Agregar clase&quot; para crear el primero.
                </li>
              )}
              {sorted.map((ev) => {
                const start = new Date(ev.starts_at);
                const end = ev.ends_at ? new Date(ev.ends_at) : null;
                const { day, month } = formatEventDayShort(start);
                const joinUrl = getEventJoinUrl(ev);
                const isNext = ev.id === nextUpcomingId;

                return (
                  <li key={ev.id} className="px-4 sm:px-6 py-5">
                    <article className="rounded-xl border border-white/10 bg-[#12151c] p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row lg:gap-6">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <div className="text-center w-14 shrink-0 pt-1">
                            <div className="text-2xl font-bold text-white leading-none">{day}</div>
                            <div className="text-[10px] font-bold tracking-wider text-slate-400 mt-1">
                              {month}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {isNext && (
                                <span className="text-[10px] font-bold tracking-wide text-amber-400 border border-amber-500/40 rounded px-2 py-0.5">
                                  PRÓXIMA CLASE
                                </span>
                              )}
                              <span className="text-[10px] font-semibold uppercase text-slate-500">
                                {EVENT_LEVEL_LABELS[ev.event_level as EventLevel]}
                              </span>
                              {!ev.is_published && (
                                <span className="text-[10px] font-semibold uppercase text-red-400/90">
                                  Oculto
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-white mt-2 leading-snug">
                              {ev.title}
                            </h4>
                            {ev.description && (
                              <p className="text-sm text-slate-400 mt-2 line-clamp-3">{ev.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>📅 {formatEventAdminMeta(start, end)}</span>
                              {joinUrl && (
                                <a
                                  href={joinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-300/90 hover:text-amber-200 truncate max-w-full sm:max-w-md"
                                >
                                  🔗 {joinUrl}
                                </a>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:w-56 shrink-0 flex flex-col gap-3">
                          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
                            <span>Visible para usuarios</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={ev.is_published}
                              onClick={() => togglePublished(ev)}
                              className={`relative h-6 w-11 rounded-full transition-colors ${
                                ev.is_published ? 'bg-amber-500' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  ev.is_published ? 'translate-x-5' : ''
                                }`}
                              />
                            </button>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(ev)}
                              className="flex-1 min-w-[7rem] rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => markComplete(ev)}
                              className="flex-1 min-w-[7rem] rounded-lg bg-amber-500/90 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                            >
                              Completar
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(ev.id)}
                              className="w-full rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/60"
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
          </div>
        )}
      </section>

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
