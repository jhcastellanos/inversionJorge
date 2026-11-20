'use client';

import { useCallback, useEffect, useState } from 'react';
import { oneOnOneStatusLabel, type OneOnOneStatus } from '../../lib/oneOnOneTypes';
import {
  ONE_ON_ONE_DURATION_MINUTES,
  ONE_ON_ONE_PRICE_USD,
  ONE_ON_ONE_TIMEZONE_LABEL,
  formatOneOnOneDateTime,
} from '../../lib/oneOnOneMeetings.constants';
import OneOnOneSlotPicker from './OneOnOneSlotPicker';

type Slot = { startAt: string; label: string };
type RequestRow = {
  id: number;
  status: OneOnOneStatus;
  meeting_start_at: string;
  note: string;
  alternative_slots: string[] | null;
  admin_message: string | null;
  payment_deadline_at: string | null;
};

export default function MemberOneOnOnePanel({
  initialPayId,
  initialPickId,
}: {
  initialPayId?: number | null;
  initialPickId?: number | null;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, rRes] = await Promise.all([
        fetch('/api/member/one-on-one/slots'),
        fetch('/api/member/one-on-one/requests'),
      ]);
      const sData = await sRes.json();
      const rData = await rRes.json();
      if (!sRes.ok) throw new Error(sData.error || 'Error slots');
      if (!rRes.ok) throw new Error(rData.error || 'Error solicitudes');
      setSlots(sData.slots ?? []);
      setRequests(rData.requests ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (initialPayId) void startPay(initialPayId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPayId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/member/one-on-one/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_start_at: selectedSlot, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar');
      setNote('');
      setSelectedSlot('');
      setSuccess('Solicitud enviada. Revisa tu correo; el equipo te responderá pronto.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSending(false);
    }
  };

  const startPay = async (requestId: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/member/one-on-one/requests/${requestId}/checkout`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de pago');
    }
  };

  const pickAlternative = async (requestId: number, slot: string) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/member/one-on-one/requests/${requestId}/select-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_start_at: slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo reservar');
      setSuccess('Horario confirmado. Ahora puedes completar el pago.');
      await load();
      if (data.request?.id) await startPay(data.request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSending(false);
    }
  };

  const pickRequest = initialPickId
    ? requests.find((r) => r.id === initialPickId)
    : requests.find((r) => r.status === 'awaiting_client_slot');

  return (
    <div className="space-y-8 max-w-3xl">
      <section className="ventic-surface border ventic-border rounded-2xl p-6">
        <h2 className="text-lg font-bold ventic-text">Solicitar reunión 1-1</h2>
        <p className="text-sm ventic-muted mt-2 leading-relaxed">
          Sesión de hasta <strong>{ONE_ON_ONE_DURATION_MINUTES} minutos</strong> (límite típico Zoom gratuito).
          Horarios de <strong>lunes a viernes</strong>, 12:00–20:00 ({ONE_ON_ONE_TIMEZONE_LABEL}). Precio fijo:{' '}
          <strong>USD {ONE_ON_ONE_PRICE_USD}</strong>. Sin pago hasta que aprobemos tu horario.
        </p>

        <div
          className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3.5"
          role="note"
        >
          <p className="text-sm font-semibold ventic-text">Importante — prepara tus dudas antes de la sesión</p>
          <p className="text-sm ventic-muted mt-1.5 leading-relaxed">
            Solo disponemos de <strong className="ventic-text">{ONE_ON_ONE_DURATION_MINUTES} minutos</strong> por
            reunión. Para aprovechar el tiempo al máximo,{' '}
            <strong className="ventic-text">ven con tus preguntas claras y priorizadas</strong> (qué quieres resolver,
            en qué orden y con qué contexto). En el formulario, descríbelas con detalle; si no llegamos a todo en una
            sesión, podrás solicitar otra más adelante.
          </p>
        </div>

        {loading ? (
          <p className="text-sm ventic-muted mt-4">Cargando calendario…</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <OneOnOneSlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            <div>
              <label className="block text-sm font-medium ventic-text mb-1" htmlFor="ooo-note">
                Tus dudas para la sesión (sé concreto)
              </label>
              <p className="text-xs ventic-muted mb-2">
                Lista las preguntas o temas en orden de prioridad. Cuanto más claro vengas, más podremos avanzar en{' '}
                {ONE_ON_ONE_DURATION_MINUTES} minutos.
              </p>
              <textarea
                id="ooo-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                minLength={10}
                rows={4}
                className="w-full rounded-lg border ventic-border px-3 py-2 text-sm ventic-text ventic-surface"
                placeholder="Ej.: 1) Cómo estructurar mi portafolio actual… 2) Duda sobre comisiones en IBKR… 3) Revisar mi plan de salidas…"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={sending || !selectedSlot}
              className="rounded-lg bg-[var(--ventic-accent)] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Enviar solicitud (sin pago)'}
            </button>
          </form>
        )}
      </section>

      {pickRequest && (
        <section className="ventic-surface border border-amber-300/50 rounded-2xl p-6 bg-amber-50/30">
          <h3 className="font-bold ventic-text">Horarios alternativos — solicitud #{pickRequest.id}</h3>
          {pickRequest.admin_message && (
            <p className="text-sm ventic-muted mt-2">{pickRequest.admin_message}</p>
          )}
          <ul className="mt-4 space-y-2">
            {(pickRequest.alternative_slots ?? []).map((slot) => (
              <li key={slot}>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => void pickAlternative(pickRequest.id, slot)}
                  className="w-full text-left rounded-lg border ventic-border px-4 py-3 text-sm hover:bg-ventic-accent-soft"
                >
                  {formatOneOnOneDateTime(slot, { dateStyle: 'full', timeStyle: 'short' })}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold ventic-text mb-3">Mis solicitudes</h2>
        {requests.length === 0 ? (
          <p className="text-sm ventic-muted">Aún no has solicitado reuniones.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => (
              <li key={r.id} className="ventic-surface border ventic-border rounded-xl p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold ventic-text">
                    {formatOneOnOneDateTime(r.meeting_start_at, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {oneOnOneStatusLabel(r.status)}
                  </span>
                </div>
                <p className="text-sm ventic-text mt-2 whitespace-pre-wrap">{r.note}</p>
                {r.status === 'awaiting_payment' && (
                  <button
                    type="button"
                    onClick={() => void startPay(r.id)}
                    className="mt-3 rounded-lg bg-[var(--ventic-accent)] text-white px-4 py-2 text-sm font-semibold"
                  >
                    Pagar USD {ONE_ON_ONE_PRICE_USD} y confirmar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

