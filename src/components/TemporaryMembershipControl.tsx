'use client';

import { useCallback, useEffect, useState } from 'react';

type TempMembership = {
  Id: number;
  Name: string;
  MonthlyPrice: number | string;
  IsActive: boolean;
};

export default function TemporaryMembershipControl() {
  const [membership, setMembership] = useState<TempMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/memberships/temporary');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar');
      setMembership(data.membership);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async () => {
    if (!membership) return;
    const nextActive = !membership.IsActive;
    setToggling(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/memberships/temporary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      setMembership(data.membership);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Cargando control de membresía temporal...
      </div>
    );
  }

  const isVisible = membership?.IsActive === true;

  return (
    <div className="mb-8 rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Control rápido
          </p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">
            Membresía temporal — $150/mes
          </h3>
          <p className="text-sm text-gray-600 mt-2 max-w-xl">
            Actívala cuando quieras que alguien la vea y compre. Desactívala cuando
            termine la venta. En Stripe siempre se cobra{' '}
            <strong>$150 USD cada mes</strong> (suscripción recurrente mensual).
          </p>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">
            Los planes permanentes <strong>Mensual ($200)</strong>,{' '}
            <strong>Trimestral ($540)</strong> y <strong>Semestral ($900)</strong> no se
            modifican: siguen visibles y cobrando igual, con sus precios e intervalos
            habituales.
          </p>
          {membership && (
            <p className="text-sm text-gray-500 mt-2">
              Plan: <strong>{membership.Name}</strong> · ID #{membership.Id}
            </p>
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-3">
          <span
            className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold ${
              isVisible
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isVisible ? 'Visible en el sitio' : 'Oculta del sitio'}
          </span>

          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling || !membership}
            className={`min-w-[200px] rounded-lg px-6 py-3 font-bold text-white transition-all disabled:opacity-50 ${
              isVisible
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {toggling
              ? 'Actualizando...'
              : isVisible
                ? 'Ocultar del sitio'
                : 'Mostrar en el sitio'}
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm font-medium text-green-800">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      )}
    </div>
  );
}
