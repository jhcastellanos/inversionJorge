'use client';

import { useCallback, useEffect, useState } from 'react';
import { oneOnOneStatusLabel, type OneOnOneStatus } from '../../lib/oneOnOneTypes';
import { formatOneOnOneDateTime } from '../../lib/oneOnOneMeetings.constants';

type BookableSlot = { startAt: string; label: string; weekdayLabel: string };

type AdminRequest = {
  id: number;
  status: OneOnOneStatus;
  meeting_start_at: string;
  note: string;
  user_email: string;
  user_full_name: string;
  alternative_slots: string[] | null;
  admin_message: string | null;
  client_message: string | null;
};

const listCard = 'ventic-surface border ventic-border rounded-xl overflow-hidden';
const detailCard = 'ventic-surface border ventic-border rounded-xl p-6 min-h-[24rem]';
const btnPrimary =
  'rounded-xl bg-[var(--ventic-accent)] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--ventic-accent-hover)] disabled:opacity-50 w-full sm:w-auto';
const btnAmber =
  'rounded-xl bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 w-full sm:w-auto';
const btnDanger =
  'rounded-xl border border-red-500/50 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50';

export default function AdminOneOnOnePanel() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [altSlots, setAltSlots] = useState<string[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [allSlots, setAllSlots] = useState<BookableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        fetch('/api/admin/one-on-one/requests'),
        fetch('/api/member/one-on-one/slots'),
      ]);
      const rData = await rRes.json();
      const sData = await sRes.json();
      if (!rRes.ok) throw new Error(rData.error || 'Error');
      setRequests(rData.requests ?? []);
      setPendingCount(rData.pendingCount ?? 0);
      if (sRes.ok) setAllSlots(sData.slots ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const patch = async (body: Record<string, unknown>) => {
    if (selectedId == null) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/one-on-one/requests/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setAltSlots([]);
      setAdminMessage('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlt = (startAt: string) => {
    setAltSlots((prev) =>
      prev.includes(startAt) ? prev.filter((s) => s !== startAt) : [...prev, startAt].slice(0, 8)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <div className={listCard}>
        <div className="px-4 py-3 border-b ventic-border flex items-center justify-between">
          <h3 className="font-semibold ventic-text">Solicitudes 1-1</h3>
          {pendingCount > 0 && (
            <span className="text-xs font-bold bg-red-600 text-white rounded-full px-2 py-0.5">
              {pendingCount} nuevas
            </span>
          )}
        </div>
        {loading ? (
          <p className="p-4 text-sm ventic-muted">Cargando…</p>
        ) : (
          <ul className="max-h-[32rem] overflow-y-auto divide-y ventic-border">
            {requests.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(r.id);
                    setAltSlots([]);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-ventic-accent-soft transition-colors ${
                    selectedId === r.id
                      ? 'bg-ventic-accent-soft border-l-4 border-[var(--ventic-accent)]'
                      : ''
                  }`}
                >
                  <p className="text-sm font-medium ventic-text">
                    {r.user_full_name} · #{r.id}
                  </p>
                  <p className="text-xs ventic-muted">{oneOnOneStatusLabel(r.status)}</p>
                  <p className="text-xs ventic-muted mt-1 opacity-80">
                    {formatOneOnOneDateTime(r.meeting_start_at, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={detailCard}>
        {!selected ? (
          <p className="text-sm ventic-muted">Selecciona una solicitud.</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold ventic-text">
              Solicitud #{selected.id} — {selected.user_full_name}
            </h3>
            <p className="text-sm ventic-muted">{selected.user_email}</p>
            <p className="text-sm ventic-text">
              <strong>Horario pedido:</strong>{' '}
              {formatOneOnOneDateTime(selected.meeting_start_at, {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-sm ventic-text whitespace-pre-wrap ventic-surface border ventic-border rounded-lg p-4 bg-black/10">
              {selected.note}
            </p>

            {selected.client_message && selected.status === 'pending_admin' && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm ventic-text">
                <p className="font-semibold">Contrapropuesta del miembro</p>
                <p className="mt-2 whitespace-pre-wrap">{selected.client_message}</p>
              </div>
            )}

            {selected.status === 'awaiting_client_slot' && (
              <p className="text-sm ventic-text rounded-xl border ventic-border bg-ventic-accent-soft/40 p-3">
                Esperando respuesta del miembro en <strong>/reunion-1a1</strong>.
              </p>
            )}

            {['pending_admin', 'awaiting_client_slot'].includes(selected.status) && (
              <div className="space-y-4 border-t ventic-border pt-4">
                {selected.status === 'pending_admin' && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void patch({ action: 'approve' })}
                    className={btnPrimary}
                  >
                    Aprobar horario solicitado
                  </button>
                )}

                <div>
                  <p className="text-sm font-medium ventic-text mb-2">Proponer otros horarios</p>
                  <div className="max-h-48 overflow-y-auto grid gap-1 sm:grid-cols-2 border ventic-border rounded-lg p-2">
                    {allSlots.map((slot) => (
                      <label
                        key={slot.startAt}
                        className="flex items-start gap-2 text-xs cursor-pointer ventic-text"
                      >
                        <input
                          type="checkbox"
                          checked={altSlots.includes(slot.startAt)}
                          onChange={() => toggleAlt(slot.startAt)}
                        />
                        <span>{slot.weekdayLabel}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    rows={2}
                    placeholder="Mensaje opcional al miembro"
                    className="mt-2 w-full border ventic-border rounded-lg px-3 py-2 text-sm ventic-text ventic-surface"
                  />
                  <button
                    type="button"
                    disabled={saving || altSlots.length === 0}
                    onClick={() =>
                      void patch({
                        action: 'propose_alternatives',
                        alternative_slots: altSlots,
                        admin_message: adminMessage,
                      })
                    }
                    className={`mt-3 ${btnAmber}`}
                  >
                    Enviar horarios alternativos
                  </button>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void patch({ action: 'decline', admin_message: adminMessage })}
                  className={btnDanger}
                >
                  Rechazar solicitud
                </button>
              </div>
            )}

            {!['pending_admin', 'awaiting_client_slot', 'awaiting_payment'].includes(selected.status) && (
              <p className="text-sm ventic-muted border-t ventic-border pt-4">
                Estado: {oneOnOneStatusLabel(selected.status)}
              </p>
            )}

            {selected.status === 'awaiting_payment' && (
              <p className="text-sm ventic-muted border-t ventic-border pt-4">
                Horario acordado. El miembro completa el pago desde su cuenta.
              </p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}