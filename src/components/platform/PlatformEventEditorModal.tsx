'use client';

import { useEffect, useState } from 'react';
import {
  LIVE_EVENT_TIER_AUDIENCE,
  LIVE_EVENT_TIER_LABELS,
  LIVE_EVENT_TIERS,
  type LiveEventTier,
} from '../../lib/platformRoles';
import {
  eventDurationMinutes,
  toDatetimeLocalValue,
  type SerializedEvent,
} from '../../lib/platformEventDisplay';

export type EventEditorPayload = {
  title: string;
  description: string;
  zoom_url: string;
  event_tier: LiveEventTier;
  starts_at: string;
  duration_minutes: number;
  is_published: boolean;
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: SerializedEvent | null;
  onClose: () => void;
  onSave: (payload: EventEditorPayload) => Promise<void>;
};


const labelClass = 'block text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase';
const fieldClass =
  'mt-2 w-full rounded-[10px] border border-white/10 bg-[#141820] px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-500/30';

function SaveIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5h12v16H5V5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M5 5h12v4H5V5Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function PlatformEventEditorModal({ open, mode, initial, onClose, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventEditorPayload>({
    title: '',
    description: '',
    zoom_url: '',
    event_tier: 'clase_retrospectiva',
    starts_at: '',
    duration_minutes: 60,
    is_published: true,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === 'edit' && initial) {
      const start = new Date(initial.starts_at);
      const end = initial.ends_at ? new Date(initial.ends_at) : null;
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        zoom_url: initial.zoom_url ?? '',
        event_tier: initial.event_tier ?? 'clase_retrospectiva',
        starts_at: toDatetimeLocalValue(initial.starts_at),
        duration_minutes: eventDurationMinutes(start, end),
        is_published: initial.is_published,
      });
    } else {
      setForm({
        title: '',
        description: '',
        zoom_url: '',
        event_tier: 'clase_retrospectiva',
        starts_at: '',
        duration_minutes: 60,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0c10] shadow-2xl text-white overflow-hidden">
        <form onSubmit={submit} className="px-6 sm:px-8 py-7 sm:py-8 space-y-5 max-h-[90vh] overflow-y-auto">
          {error && (
            <p className="text-sm text-red-300 bg-red-950/50 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="block">
            <span className={labelClass}>Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={fieldClass}
              placeholder="Intradia Clases En Vivo"
            />
          </label>

          <label className="block">
            <span className={labelClass}>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className={`${fieldClass} resize-y min-h-[100px]`}
              placeholder="Intradia Retro y Clases de la Estrategia en Vivo"
            />
          </label>

          <label className="block">
            <span className={labelClass}>Meeting link</span>
            <input
              type="url"
              value={form.zoom_url}
              onChange={(e) => setForm((f) => ({ ...f, zoom_url: e.target.value }))}
              className={fieldClass}
              placeholder="https://us06web.zoom.us/j/…"
            />
          </label>

          <label className="block">
            <span className={labelClass}>Tipo de evento en vivo</span>
            <select
              value={form.event_tier}
              onChange={(e) => setForm((f) => ({ ...f, event_tier: e.target.value as LiveEventTier }))}
              className={fieldClass}
            >
              {LIVE_EVENT_TIERS.map((k) => (
                <option key={k} value={k} className="bg-[#141820]">
                  {LIVE_EVENT_TIER_LABELS[k]}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">{LIVE_EVENT_TIER_AUDIENCE[form.event_tier]}</p>
          </label>

          <label className="block sm:max-w-[200px]">
            <span className={labelClass}>Duration (minutes)</span>
            <input
              type="number"
              min={15}
              max={480}
              step={15}
              required
              value={form.duration_minutes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  duration_minutes: Math.max(15, Number(e.target.value) || 60),
                }))
              }
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={`${labelClass} flex items-center gap-1.5`}>
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Scheduled date &amp; time (EST)
            </span>
            <input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              className={`${fieldClass} [color-scheme:dark]`}
            />
          </label>

          <label className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-[#141820] text-amber-500 focus:ring-amber-500/40"
            />
            <span className="text-sm text-slate-400">Visible en inicio y calendario</span>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-b from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-slate-950 hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 shadow-lg shadow-amber-900/30"
            >
              <SaveIcon />
              {saving ? 'Guardando…' : mode === 'create' ? 'Crear evento' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              <span className="text-slate-400" aria-hidden>
                ✕
              </span>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
