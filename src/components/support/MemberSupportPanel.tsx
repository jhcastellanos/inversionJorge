'use client';

import { useCallback, useEffect, useState } from 'react';
import { memberTicketStatusLabel, type SupportTicketRow } from '../../lib/supportTicketTypes';

export default function MemberSupportPanel() {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/member/support-tickets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setTickets(data.tickets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/member/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, is_anonymous: isAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar');
      setTitle('');
      setBody('');
      setIsAnonymous(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <section className="ventic-surface border ventic-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold ventic-text">Nueva consulta</h2>
        <p className="text-sm ventic-muted mt-1">
          Cuéntanos qué necesitas. Si marcas anónimo, en el listado del equipo aparecerás como &quot;Anónimo&quot;;
          igual podrán responderte en tu cuenta privada.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium ventic-text mb-1" htmlFor="ticket-title">
              Título (opcional)
            </label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border ventic-border px-3 py-2 text-sm ventic-text ventic-surface"
              placeholder="Ej. Problema con mi acceso"
            />
          </div>
          <div>
            <label className="block text-sm font-medium ventic-text mb-1" htmlFor="ticket-body">
              Mensaje
            </label>
            <textarea
              id="ticket-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={10}
              rows={5}
              className="w-full rounded-lg border ventic-border px-3 py-2 text-sm ventic-text ventic-surface"
              placeholder="Describe tu duda o inquietud…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm ventic-text cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar como anónimo en el panel del equipo
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-[var(--ventic-accent)] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {sending ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-bold ventic-text mb-3">Mis consultas</h2>
        {loading ? (
          <p className="text-sm ventic-muted">Cargando…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm ventic-muted">Aún no has enviado consultas.</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((t) => (
              <li key={t.id} className="ventic-surface border ventic-border rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <TicketHeader t={t} />
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${
                      t.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'read'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {memberTicketStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-sm ventic-text mt-3 whitespace-pre-wrap">{t.body}</p>
                {t.admin_response && (
                  <div className="mt-4 border-t ventic-border pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--ventic-accent-muted)]">
                      Respuesta del equipo
                    </p>
                    <p className="text-sm ventic-text mt-2 whitespace-pre-wrap">{t.admin_response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TicketHeader({ t }: { t: SupportTicketRow }) {
  return (
    <div>
      <p className="font-semibold ventic-text">{t.title?.trim() || `Consulta #${t.id}`}</p>
      <p className="text-xs ventic-muted mt-0.5">
        {new Date(t.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
        {t.is_anonymous ? ' · Anónimo' : ''}
      </p>
    </div>
  );
}
