/** Acceso estudiante otorgado por el producto Stripe (pago único). */
export const ALUMNO_PACKAGE_ACCESS_YEARS = 1;

export function getAlumnoPackageStripePriceId(): string | null {
  const id = process.env.STRIPE_ALUMNO_PACKAGE_PRICE_ID?.trim();
  return id || null;
}

export function isAlumnoPackageCheckoutEnabled(): boolean {
  return Boolean(getAlumnoPackageStripePriceId() && process.env.STRIPE_SECRET_KEY);
}

/** Texto en UI; el precio real lo define el Price en Stripe. */
export function getAlumnoPackageDisplayPriceUsd(): number | null {
  const raw = process.env.NEXT_PUBLIC_ALUMNO_PACKAGE_PRICE_USD?.trim();
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const ALUMNO_PACKAGE_DEFAULT_TITLE = 'Paquete Cursos — Estudiante (1 año)';