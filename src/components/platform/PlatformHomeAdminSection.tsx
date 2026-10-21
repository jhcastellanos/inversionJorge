'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EVENT_LEVEL_LABELS, type EventLevel } from '../../lib/platformRoles';
import type { SerializedEvent } from '../../lib/platformEventDisplay';

export default function PlatformHomeAdminSection({ initialEvents }: { initialEvents: SerializedEvent[] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
        starts_at: e.starts_at,
        ends_at: e.ends_at,
      }))
    );
    router.refresh();
  };

  const addEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/platform-calendar-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        event_level: fd.get('event_level'),
        starts_at: fd.get('starts_at'),
        ends_at: fd.get('ends_at') || null,
        description: fd.get('description') || '',
      }),
    });
    if (!res.ok) {
      setError('Error al crear evento');
      return;
    }
    e.currentTarget.reset();
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

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar evento?')) return;
    await fetch(`/api/admin/platform-calendar-events/${id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <section className="mt-10 border border-blue-400/30 rounded-2xl bg-blue-950/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-blue-200 font-semibold hover:bg-white/5"
      >
        <span>Admin — gestionar eventos del inicio</span>
        <span className="text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-6 space-y-6 border-t border-blue-400/20">
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          <form onSubmit={addEvent} className="grid sm:grid-cols-2 gap-3 mt-4">
            <input
              name="title"
              required
              placeholder="Título del evento"
              className="rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white"
            />
            <select
              name="event_level"
              className="rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white"
            >
              {(Object.keys(EVENT_LEVEL_LABELS) as EventLevel[]).map((k) => (
                <option key={k} value={k}>
                  {EVENT_LEVEL_LABELS[k]}
                </option>
              ))}
            </select>
            <input
              name="starts_at"
              type="datetime-local"
              required
              className="rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white"
            />
            <input
              name="ends_at"
              type="datetime-local"
              className="rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white"
            />
            <textarea
              name="description"
              placeholder="Descripción / enlace Zoom (opcional)"
              className="sm:col-span-2 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white"
              rows={2}
            />
            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-blue-600 text-white py-2 text-sm font-bold hover:bg-blue-500"
            >
              Publicar evento
            </button>
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/80 px-3 py-2 border border-slate-700"
              >
                <span className="text-white">
                  {ev.title}{' '}
                  <span className="text-slate-500">({EVENT_LEVEL_LABELS[ev.event_level]})</span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-blue-300 hover:underline"
                    onClick={() => togglePublished(ev)}
                  >
                    {ev.is_published ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => remove(ev.id)}>
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            Usuarios y clases: usa las secciones Admin en{' '}
            <a href="/app/clases" className="text-blue-300 underline">
              Academia
            </a>{' '}
            o contacta soporte para membresías legacy en /admin.
          </p>
        </div>
      )}
    </section>
  );
}
