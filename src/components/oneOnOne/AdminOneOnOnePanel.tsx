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
};

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Solicitudes 1-1</h3>
          {pendingCount > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
              {pendingCount} nuevas
            </span>
          )}
        </div>
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Cargando…</p>
        ) : (
          <ul className="max-h-[32rem] overflow-y-auto divide-y">
            {requests.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(r.id);
                    setAltSlots([]);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
                    selectedId === r.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {r.user_full_name} · #{r.id}
                  </p>
                  <p className="text-xs text-gray-500">{oneOnOneStatusLabel(r.status)}</p>
                  <p className="text-xs text-gray-400 mt-1">
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[24rem]">
        {!selected ? (
          <p className="text-sm text-gray-500">Selecciona una solicitud.</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Solicitud #{selected.id} — {selected.user_full_name}
            </h3>
            <p className="text-sm text-gray-600">{selected.user_email}</p>
            <p className="text-sm">
              <strong>Horario pedido:</strong>{' '}
              {formatOneOnOneDateTime(selected.meeting_start_at, {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 border rounded-lg p-4">
              {selected.note}
            </p>

            {selected.status === 'pending_admin' && (
              <div className="space-y-4 border-t pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void patch({ action: 'approve' })}
                  className="rounded-lg bg-green-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Aprobar horario solicitado
                </button>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Proponer otros horarios</p>
                  <div className="max-h-48 overflow-y-auto grid gap-1 sm:grid-cols-2 border rounded-lg p-2">
                    {allSlots.map((slot) => (
                      <label key={slot.startAt} className="flex items-start gap-2 text-xs cursor-pointer">
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
                    className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
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
                    className="mt-2 rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Enviar horarios alternativos
                  </button>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void patch({ action: 'decline', admin_message: adminMessage })}
                  className="text-sm text-red-700 underline"
                >
                  Rechazar solicitud
                </button>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}