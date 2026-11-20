'use client';

import { useCallback, useEffect, useState } from 'react';
import { memberTicketStatusLabel, type SupportTicketStatus, type SupportTicketWithUser } from '../../lib/supportTicketTypes';

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 8.5h9M7.5 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 20v-4.2c-3.5-.4-5-2.5-5-5.3V9c0-4 2.5-6 7-6h5c4.5 0 7 2 7 6v5.5c0 3.3-2 5.5-6 5.5H11l-6 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const listCard = 'ventic-surface border ventic-border rounded-xl overflow-hidden';
const detailCard = 'ventic-surface border ventic-border rounded-xl p-6 min-h-[20rem]';
const btnPrimary =
  'rounded-xl bg-[var(--ventic-accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--ventic-accent-hover)] disabled:opacity-50';

export default function AdminSupportTicketsPanel() {
  const [tickets, setTickets] = useState<SupportTicketWithUser[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{
    body: string;
    title: string | null;
    status: string;
    userLabel: string;
    admin_response: string | null;
  } | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support-tickets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setTickets(data.tickets ?? []);
      setOpenCount(data.openCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/support-tickets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      const t = data.ticket;
      const anonNote = t.is_anonymous ? ' (el usuario pidió discreción en el listado)' : '';
      setDetail({
        body: t.body,
        title: t.title,
        status: t.status,
        admin_response: t.admin_response,
        userLabel: data.user
          ? `${data.user.full_name} · ${data.user.email}${anonNote}`
          : 'Usuario',
      });
      setResponse(t.admin_response ?? '');
      setSelectedId(id);
      void loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al abrir');
    }
  }, [loadList]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const sendResponse = async () => {
    if (selectedId == null) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/support-tickets/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      await loadDetail(selectedId);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al responder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6">
      <div className={listCard}>
        <div className="flex items-center gap-2 px-4 py-3 border-b ventic-border">
          <ChatBubbleIcon className="w-5 h-5 text-[var(--ventic-accent)]" />
          <h3 className="font-semibold ventic-text">Consultas</h3>
          {openCount > 0 && (
            <span className="ml-auto text-xs font-bold bg-red-600 text-white rounded-full px-2 py-0.5">
              {openCount} nuevas
            </span>
          )}
        </div>
        {loading ? (
          <p className="p-4 text-sm ventic-muted">Cargando…</p>
        ) : tickets.length === 0 ? (
          <p className="p-4 text-sm ventic-muted">Sin consultas por ahora.</p>
        ) : (
          <ul className="max-h-[32rem] overflow-y-auto divide-y ventic-border">
            {tickets.map((t) => {
              const active = selectedId === t.id;
              const label = t.is_anonymous ? 'Anónimo' : t.user_full_name;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(t.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-ventic-accent-soft transition-colors ${
                      active ? 'bg-ventic-accent-soft border-l-4 border-[var(--ventic-accent)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChatBubbleIcon className="w-4 h-4 ventic-muted shrink-0" />
                      <span className="font-medium ventic-text text-sm truncate">
                        {t.title?.trim() || `Consulta #${t.id}`}
                      </span>
                    </div>
                    <p className="text-xs ventic-muted mt-1 truncate">{label}</p>
                    <p className="text-xs ventic-muted mt-0.5 opacity-80">
                      {memberTicketStatusLabel(t.status)} ·{' '}
                      {new Date(t.created_at).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={detailCard}>
        {!detail || selectedId == null ? (
          <p className="text-sm ventic-muted">Selecciona una consulta para leerla y responder.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold ventic-text">
                {detail.title?.trim() || `Consulta #${selectedId}`}
              </h3>
              <p className="text-sm ventic-muted mt-1">{detail.userLabel}</p>
              <p className="text-xs ventic-muted mt-1">
                Estado: {memberTicketStatusLabel(detail.status as SupportTicketStatus)}
              </p>
            </div>
            <p className="text-sm ventic-text whitespace-pre-wrap border ventic-border rounded-lg p-4 bg-black/10">
              {detail.body}
            </p>
            <div>
              <label className="block text-sm font-medium ventic-text mb-1" htmlFor="admin-response">
                Tu respuesta (visible en la cuenta del usuario)
              </label>
              <textarea
                id="admin-response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="w-full border ventic-border rounded-lg px-3 py-2 text-sm ventic-text ventic-surface"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              disabled={saving || response.trim().length < 2}
              onClick={() => void sendResponse()}
              className={btnPrimary}
            >
              {saving ? 'Guardando…' : 'Enviar respuesta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}