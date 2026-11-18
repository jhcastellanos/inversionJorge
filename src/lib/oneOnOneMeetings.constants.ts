/** Límite típico de reuniones en plan gratuito de Zoom (40 min). */
export const ONE_ON_ONE_DURATION_MINUTES = 40;
export const ONE_ON_ONE_PRICE_USD = 100;
export const ONE_ON_ONE_PRICE_CENTS = ONE_ON_ONE_PRICE_USD * 100;
export const ONE_ON_ONE_MIN_LEAD_HOURS = 24;
export const ONE_ON_ONE_PAYMENT_DEADLINE_HOURS_BEFORE = 3;

export const ONE_ON_ONE_SLOT_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20] as const;

/** Florida (Eastern Time, incluye Miami): siempre IANA America/New_York */
export const ONE_ON_ONE_TIMEZONE = 'America/New_York';
export const ONE_ON_ONE_TIMEZONE_LABEL = 'hora Florida (ET)';

export function formatOneOnOneDateTime(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString('es-US', {
    timeZone: ONE_ON_ONE_TIMEZONE,
    ...options,
  });
}