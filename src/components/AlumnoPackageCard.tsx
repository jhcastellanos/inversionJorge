'use client';

import { useEffect, useState } from 'react';

type PackageStatus = {
  checkoutEnabled: boolean;
  title: string;
  accessYears: number;
  displayPriceUsd: number | null;
  accessActive: boolean;
  accessUntil: string | null;
};

export default function AlumnoPackageCard() {
  const [status, setStatus] = useState<PackageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/member/alumno-package/status');
        const data = await res.json();
        if (!cancelled) {
          if (res.ok) setStatus(data);
          else setStatus(null);
        }
      } catch {
        if (!cancelled) setStatus(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const checkout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/alumno-package-checkout', { method: 'POST' });
      const data = await res.json();
      if (res.status === 403 && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return null;
  if (!status?.checkoutEnabled) return null;

  const priceLabel =
    status.displayPriceUsd != null ? `USD ${status.displayPriceUsd.toFixed(0)}` : 'Ver precio en Stripe';

  return (
    <div className="mb-10 rounded-2xl border-2 border-[var(--ventic-accent)]/40 ventic-surface p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--ventic-accent)]">
            Producto Stripe · Pago único
          </p>
          <h3 className="text-2xl font-bold ventic-text mt-1">{status.title}</h3>
          <p className="text-sm ventic-muted mt-2 leading-relaxed">
            Rol <strong>Estudiante</strong> y acceso a academia/clases de estudiante durante{' '}
            <strong>{status.accessYears} año</strong> completo desde la fecha de compra. Si también tienes
            membresía Trader activa, tu rol pasa a <strong>Trader + Estudiante</strong> hasta que expire
            uno u otro.
          </p>
          {status.accessActive && status.accessUntil && (
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              Tu acceso estudiante está vigente hasta{' '}
              {new Date(status.accessUntil).toLocaleDateString('es-MX', { dateStyle: 'long' })}.
            </p>
          )}
        </div>
        <div className="shrink-0 text-center lg:text-right">
          <p className="text-3xl font-extrabold ventic-text">{priceLabel}</p>
          <p className="text-xs ventic-muted mt-1">1 año de acceso desde la compra</p>
          <button
            type="button"
            disabled={checkingOut}
            onClick={() => void checkout()}
            className="mt-4 w-full lg:w-auto rounded-lg bg-[var(--ventic-accent)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {checkingOut ? 'Redirigiendo…' : status.accessActive ? 'Renovar / extender' : 'Comprar paquete'}
          </button>
          {error && <p className="mt-2 text-xs text-red-600 max-w-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}