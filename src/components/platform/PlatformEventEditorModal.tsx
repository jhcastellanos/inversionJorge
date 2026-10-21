'use client';

import { useEffect, useState } from 'react';
import {
  EVENT_LEVEL_AUDIENCE,
  EVENT_LEVEL_LABELS,
  type EventLevel,
} from '../../lib/platformRoles';
import { toDatetimeLocalValue, type SerializedEvent } from '../../lib/platformEventDisplay';

export type EventEditorPayload = {
  title: string;
  description: string;
  zoom_url: string;
  event_level: EventLevel;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: SerializedEvent | null;
  onClose: () => void;
  onSave: (payload: EventEditorPayload) => Promise<void>;
};

const LEVELS: EventLevel[] = ['basico', 'medio', 'avanzado'];

export default function PlatformEventEditorModal({ open, mode, initial, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventEditorPayload>({
    title: '',
    description: '',
    zoom_url: '',
    event_level: 'basico',
    starts_at: '',
    ends_at: '',
    is_published: true,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === 'edit' && initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        zoom_url: initial.zoom_url ?? '',
        event_level: initial.event_level,
        starts_at: toDatetimeLocalValue(initial.starts_at),
        ends_at: toDatetimeLocalValue(initial.ends_at),
        is_published: initial.is_published,
      });
    } else {
      setForm({
        title: '',
        description: '',
        zoom_url: '',
        event_level: 'basico',
        starts_at: '',
        ends_at: '',
        is_published: true,
      });
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12151c] shadow-2xl text-white overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[11px] font-bold tracking-[0.2em] text-amber-400/90 uppercase">
            {mode === 'create' ? 'Nuevo evento' : 'Editar evento'}
          </p>
          <h2 className="text-xl font-bold mt-1">
            {mode === 'create' ? 'Agregar clase en vivo' : initial?.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            El tipo de evento define qué roles lo ven (Estudiante, Trader, Inversor).
          </p>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Título</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
              placeholder="Retro Trading de Scalping"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none resize-y"
              placeholder="Breve resumen de la sesión…"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Enlace Zoom
            </span>
            <input
              type="url"
              value={form.zoom_url}
              onChange={(e) => setForm((f) => ({ ...f, zoom_url: e.target.value }))}
              className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
              placeholder="https://us06web.zoom.us/j/…"
            />
            <p className="text-xs text-slate-500 mt-1">
              Al hacer clic en &quot;Unirse&quot;, el usuario irá directo a esta URL.
            </p>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Tipo de evento
            </span>
            <select
              value={form.event_level}
              onChange={(e) => setForm((f) => ({ ...f, event_level: e.target.value as EventLevel }))}
              className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
            >
              {LEVELS.map((k) => (
                <option key={k} value={k}>
                  {EVENT_LEVEL_LABELS[k]}
                </option>
              ))}
            </select>
            <p className="text-xs text-amber-200/70 mt-1">{EVENT_LEVEL_AUDIENCE[form.event_level]}</p>
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Inicio</span>
              <input
                required
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Fin (opcional)</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                className="mt-1.5 w-full rounded-lg bg-[#0a0c10] border border-white/10 px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
              />
            </label>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0a0c10] px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Visible para usuarios</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Aparece en inicio y calendario según el tipo de evento
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              className="h-5 w-5 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-500/40"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/15 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : mode === 'create' ? 'Crear evento' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
