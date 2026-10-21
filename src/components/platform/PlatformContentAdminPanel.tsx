'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CLASS_LEVEL_LABELS,
  EVENT_LEVEL_LABELS,
  type ClassLevel,
  type EventLevel,
} from '../../lib/platformRoles';

type PlatformClassItem = {
  id: number;
  title: string;
  description: string | null;
  section_name: string;
  class_level: ClassLevel;
  video_url: string | null;
  sort_order: number;
  is_published: boolean;
};

type CalendarEventItem = {
  id: number;
  title: string;
  description: string | null;
  event_level: EventLevel;
  starts_at: string;
  ends_at: string | null;
  is_published: boolean;
};

export default function PlatformContentAdminPanel() {
  const [tab, setTab] = useState<'classes' | 'events'>('classes');
  const [classes, setClasses] = useState<PlatformClassItem[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, eRes] = await Promise.all([
        fetch('/api/admin/platform-classes'),
        fetch('/api/admin/platform-calendar-events'),
      ]);
      if (!cRes.ok || !eRes.ok) throw new Error('No se pudo cargar el contenido');
      const cJson = await cRes.json();
      const eJson = await eRes.json();
      setClasses(cJson.classes ?? []);
      setEvents(eJson.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/platform-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        section_name: fd.get('section_name'),
        class_level: fd.get('class_level'),
        video_url: fd.get('video_url') || null,
        description: fd.get('description') || '',
      }),
    });
    if (!res.ok) {
      alert('Error al crear clase');
      return;
    }
    e.currentTarget.reset();
    load();
  };

  const addEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      alert('Error al crear evento');
      return;
    }
    e.currentTarget.reset();
    load();
  };

  const toggleClassPublished = async (item: PlatformClassItem) => {
    await fetch(`/api/admin/platform-classes/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    load();
  };

  const deleteClass = async (id: number) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    await fetch(`/api/admin/platform-classes/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleEventPublished = async (item: CalendarEventItem) => {
    await fetch(`/api/admin/platform-calendar-events/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    load();
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await fetch(`/api/admin/platform-calendar-events/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('classes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'classes' ? 'bg-blue-900 text-white' : 'bg-white border text-gray-700'
          }`}
        >
          Clases
        </button>
        <button
          type="button"
          onClick={() => setTab('events')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'events' ? 'bg-blue-900 text-white' : 'bg-white border text-gray-700'
          }`}
        >
          Calendario
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Cargando…</p>}

      {!loading && tab === 'classes' && (
        <div className="space-y-8">
          <form onSubmit={addClass} className="bg-white rounded-lg border p-6 grid sm:grid-cols-2 gap-4">
            <h3 className="sm:col-span-2 font-semibold text-gray-900">Nueva clase</h3>
            <input name="title" required placeholder="Título" className="border rounded-lg px-3 py-2" />
            <input name="section_name" placeholder="Sección" defaultValue="General" className="border rounded-lg px-3 py-2" />
            <select name="class_level" required className="border rounded-lg px-3 py-2">
              {(Object.keys(CLASS_LEVEL_LABELS) as ClassLevel[]).map((k) => (
                <option key={k} value={k}>
                  {CLASS_LEVEL_LABELS[k]}
                </option>
              ))}
            </select>
            <input name="video_url" placeholder="URL del video" className="border rounded-lg px-3 py-2" />
            <textarea name="description" placeholder="Descripción" className="sm:col-span-2 border rounded-lg px-3 py-2" rows={2} />
            <button type="submit" className="sm:col-span-2 bg-blue-900 text-white rounded-lg py-2 font-medium">
              Agregar clase
            </button>
          </form>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Sección</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3" />
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3">{c.section_name}</td>
                    <td className="p-3">{CLASS_LEVEL_LABELS[c.class_level]}</td>
                    <td className="p-3">{c.is_published ? 'Publicada' : 'Oculta'}</td>
                    <td className="p-3 space-x-2">
                      <button type="button" className="text-blue-700" onClick={() => toggleClassPublished(c)}>
                        {c.is_published ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button type="button" className="text-red-600" onClick={() => deleteClass(c.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'events' && (
        <div className="space-y-8">
          <form onSubmit={addEvent} className="bg-white rounded-lg border p-6 grid sm:grid-cols-2 gap-4">
            <h3 className="sm:col-span-2 font-semibold text-gray-900">Nuevo evento</h3>
            <input name="title" required placeholder="Título" className="border rounded-lg px-3 py-2" />
            <select name="event_level" required className="border rounded-lg px-3 py-2">
              {(Object.keys(EVENT_LEVEL_LABELS) as EventLevel[]).map((k) => (
                <option key={k} value={k}>
                  {EVENT_LEVEL_LABELS[k]}
                </option>
              ))}
            </select>
            <input name="starts_at" type="datetime-local" required className="border rounded-lg px-3 py-2" />
            <input name="ends_at" type="datetime-local" className="border rounded-lg px-3 py-2" />
            <textarea name="description" placeholder="Descripción" className="sm:col-span-2 border rounded-lg px-3 py-2" rows={2} />
            <button type="submit" className="sm:col-span-2 bg-blue-900 text-white rounded-lg py-2 font-medium">
              Agregar evento
            </button>
          </form>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Inicio</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3" />
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b">
                    <td className="p-3 font-medium">{ev.title}</td>
                    <td className="p-3">{EVENT_LEVEL_LABELS[ev.event_level]}</td>
                    <td className="p-3">{new Date(ev.starts_at).toLocaleString('es-MX')}</td>
                    <td className="p-3">{ev.is_published ? 'Publicado' : 'Oculto'}</td>
                    <td className="p-3 space-x-2">
                      <button type="button" className="text-blue-700" onClick={() => toggleEventPublished(ev)}>
                        {ev.is_published ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button type="button" className="text-red-600" onClick={() => deleteEvent(ev.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
