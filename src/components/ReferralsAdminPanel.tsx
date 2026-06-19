'use client';

import { useCallback, useEffect, useState } from 'react';

type Trader = {
  id: number;
  alias: string;
  email: string;
  referral_code: string;
  referral_link: string;
  created_at: string;
};

type Conversion = {
  id: number;
  trader_alias: string;
  trader_email: string;
  referred_email: string;
  referred_name: string | null;
  referral_code: string;
  membership_type: string;
  commission_amount: string | number;
  completed_at: string;
};

type Tab = 'traders' | 'conversions';

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ReferralsAdminPanel() {
  const [tab, setTab] = useState<Tab>('traders');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendEmailOnCreate, setSendEmailOnCreate] = useState(true);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTraders = useCallback(async () => {
    const res = await fetch('/api/referrals/traders');
    if (!res.ok) throw new Error('No se pudieron cargar los referidores');
    const data = await res.json();
    setTraders(data.traders ?? []);
  }, []);

  const loadConversions = useCallback(async () => {
    const res = await fetch('/api/referrals/conversions');
    if (!res.ok) throw new Error('No se pudieron cargar las conversiones');
    const data = await res.json();
    setConversions(data.conversions ?? []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadTraders(), loadConversions()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [loadTraders, loadConversions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/referrals/traders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, email, sendEmail: sendEmailOnCreate }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 201) {
        throw new Error(data.error || 'Error al crear referidor');
      }
      setAlias('');
      setEmail('');
      await loadTraders();
      if (data.emailSent) {
        setSuccess(`Referidor creado y email enviado a ${data.trader?.email ?? email}`);
      } else if (data.emailError) {
        setSuccess('Referidor creado, pero no se pudo enviar el email.');
        setError(data.emailError);
      } else {
        setSuccess('Referidor creado correctamente.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar al referidor "${name}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/referrals/traders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      await loadTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleSendEmail = async (trader: Trader) => {
    setSendingEmailId(trader.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/referrals/traders/${trader.id}/send-email`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar el email');
      setSuccess(`Email enviado a ${trader.email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email');
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleCopyLink = async (trader: Trader) => {
    const ok = await copyText(trader.referral_link);
    if (ok) {
      setCopiedId(trader.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Referidos</h2>
        <p className="text-gray-600 mt-1">
          Administra traders referidores y consulta conversiones por compras de membresía
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('traders')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === 'traders'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Referidores
        </button>
        <button
          type="button"
          onClick={() => setTab('conversions')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === 'conversions'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Referidos Completados
          {conversions.length > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {conversions.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : tab === 'traders' ? (
        <div className="space-y-8">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre o alias
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Juan Pérez"
              />
              <p className="text-xs text-gray-400 mt-1">Se usa el primer nombre en el saludo del email</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="trader@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 disabled:opacity-50"
            >
              {submitting ? 'Creando...' : '+ Agregar referidor'}
            </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmailOnCreate}
                onChange={(e) => setSendEmailOnCreate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              Enviar email del programa de referidos al crear (desde inversionrealconjorge@gmail.com)
            </label>
          </form>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Enlace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {traders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No hay referidores registrados
                    </td>
                  </tr>
                ) : (
                  traders.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.alias}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.email}</td>
                      <td className="px-6 py-4 text-sm font-mono text-blue-900">
                        {t.referral_code}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(t)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {copiedId === t.id ? '¡Copiado!' : 'Copiar enlace'}
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[220px]">
                          {t.referral_link}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSendEmail(t)}
                          disabled={sendingEmailId === t.id}
                          className="block text-blue-900 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                          {sendingEmailId === t.id ? 'Enviando...' : 'Enviar email'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id, t.alias)}
                          className="block text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Referidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email referidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email comprador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Membresía
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Comisión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conversions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Aún no hay referidos completados
                  </td>
                </tr>
              ) : (
                conversions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {c.trader_alias}
                      {c.referred_name && (
                        <span className="block text-xs text-gray-400">{c.referred_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.trader_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.referred_email}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {c.referral_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.membership_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(c.completed_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-700">
                      ${Number(c.commission_amount).toFixed(0)} USD
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
