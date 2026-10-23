'use client';

import { useEffect, useId, useState } from 'react';
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
import {
  adminField,
  adminGhostBtn,
  adminLabel,
  adminPanelShell,
  adminPrimaryBtn,
  useAdminPanelTheme,
} from './admin/AdminPanelTheme';

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
  mode: 'create' | 'edit';
  initial?: SerializedEvent | null;
  onCancel: () => void;
  onSave: (payload: EventEditorPayload) => Promise<void>;
};

function SaveIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 5h12v16H5V5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h12v4H5V5Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function PlatformEventEditorForm({ mode, initial, onCancel, onSave }: Props) {
  const { isDark } = useAdminPanelTheme();
  const formId = useId();
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
  }, [mode, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const hintClass = isDark ? 'text-slate-500' : 'text-gray-500';
  const checkClass = isDark
    ? 'h-4 w-4 rounded border-white/20 bg-[var(--ventic-bg)] text-emerald-500 focus:ring-emerald-500/40'
    : 'h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/40';

  return (
    <section id="event-editor-form" className={`${adminPanelShell(isDark)} p-6 sm:p-8 mb-8 max-w-4xl`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-emerald-400' : 'text-[var(--ventic-accent)]'}`}>
            {mode === 'create' ? 'Nuevo evento' : 'Editar evento'}
          </p>
          <h2 className="text-xl font-bold ventic-text mt-1">
            {mode === 'create' ? 'Crear evento en vivo' : initial?.title}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
          Cerrar formulario
        </button>
      </div>

      <form id={formId} onSubmit={submit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-950/50 dark:border-red-500/30">
            {error}
          </p>
        )}

        <label className="block">
          <span className={adminLabel(isDark)}>Title</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={adminField(isDark)}
            placeholder="Intradia Clases En Vivo"
          />
        </label>

        <label className="block">
          <span className={adminLabel(isDark)}>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className={`${adminField(isDark)} resize-y min-h-[100px]`}
            placeholder="Intradia Retro y Clases de la Estrategia en Vivo"
          />
        </label>

        <label className="block">
          <span className={adminLabel(isDark)}>Meeting link</span>
          <input
            type="url"
            value={form.zoom_url}
            onChange={(e) => setForm((f) => ({ ...f, zoom_url: e.target.value }))}
            className={adminField(isDark)}
            placeholder="https://us06web.zoom.us/j/…"
          />
        </label>

        <label className="block">
          <span className={adminLabel(isDark)}>Tipo de evento en vivo</span>
          <select
            value={form.event_tier}
            onChange={(e) => setForm((f) => ({ ...f, event_tier: e.target.value as LiveEventTier }))}
            className={adminField(isDark)}
          >
            {LIVE_EVENT_TIERS.map((k) => (
              <option key={k} value={k}>
                {LIVE_EVENT_TIER_LABELS[k]}
              </option>
            ))}
          </select>
          <p className={`text-[11px] mt-1.5 ${hintClass}`}>{LIVE_EVENT_TIER_AUDIENCE[form.event_tier]}</p>
        </label>

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className={adminLabel(isDark)}>Duration (minutes)</span>
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
              className={adminField(isDark)}
            />
          </label>
          <label className="block">
            <span className={`${adminLabel(isDark)} flex items-center gap-1.5`}>
              Scheduled date &amp; time (EST)
            </span>
            <input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              className={`${adminField(isDark)} ${isDark ? '[color-scheme:dark]' : ''}`}
            />
          </label>
        </div>

        <label className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
            className={checkClass}
          />
          <span className={`text-sm ventic-muted`}>Visible en inicio y calendario</span>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t ventic-border">
          <button type="submit" disabled={saving} className={`${adminPrimaryBtn(isDark)} disabled:opacity-50`}>
            <SaveIcon />
            {saving ? 'Guardando…' : mode === 'create' ? 'Crear evento' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
