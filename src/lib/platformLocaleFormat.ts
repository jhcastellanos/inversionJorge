import type { Locale } from './i18n';
import { LIVE_EVENT_TIER_LABELS, type LiveEventTier } from './platformRoles';

const EN_LIVE_EVENT_TIER_LABELS: Record<LiveEventTier, string> = {
  clase_retrospectiva: 'Live class / retrospective',
  operativa_trading: 'Trading session',
  avanzado: 'Advanced sessions',
};

export function liveEventTierLabelForLocale(locale: Locale, tier: LiveEventTier): string {
  return locale === 'en' ? EN_LIVE_EVENT_TIER_LABELS[tier] : LIVE_EVENT_TIER_LABELS[tier];
}

const DISPLAY_TZ = 'America/New_York';

export function localeTag(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'es-ES';
}

export function greetingForLocale(locale: Locale, now = new Date()): string {
  const hour = Number(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: DISPLAY_TZ })
  );
  if (locale === 'en') {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function headerDateLineForLocale(locale: Locale, now = new Date()): string {
  return now
    .toLocaleDateString(localeTag(locale), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: DISPLAY_TZ,
    })
    .toUpperCase();
}

export function formatEventLineForLocale(locale: Locale, date: Date): string {
  const tag = localeTag(locale);
  const weekday = date.toLocaleDateString(tag, { weekday: 'short', timeZone: DISPLAY_TZ });
  const monthDay = date.toLocaleDateString(tag, {
    month: 'short',
    day: 'numeric',
    timeZone: DISPLAY_TZ,
  });
  const time = date.toLocaleTimeString(tag, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: DISPLAY_TZ,
  });
  const et = locale === 'en' ? 'ET' : 'hora ET';
  return `${weekday}, ${monthDay} • ${time} ${et}`;
}

export function formatEventDayShortForLocale(locale: Locale, date: Date) {
  const tag = localeTag(locale);
  const day = date.toLocaleDateString(tag, { day: '2-digit', timeZone: DISPLAY_TZ });
  const month = date
    .toLocaleDateString(tag, { month: 'short', timeZone: DISPLAY_TZ })
    .toUpperCase()
    .replace('.', '');
  return { day, month };
}
