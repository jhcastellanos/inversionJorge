import { ONE_ON_ONE_TIMEZONE } from './oneOnOneMeetings.constants';

/** Clave YYYY-MM-DD en hora Florida */
export function floridaDateKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ONE_ON_ONE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export function floridaTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ONE_ON_ONE_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

export function floridaDayHeader(iso: string): { weekday: string; dayNum: string; month: string } {
  const d = new Date(iso);
  return {
    weekday: new Intl.DateTimeFormat('es-US', { timeZone: ONE_ON_ONE_TIMEZONE, weekday: 'short' })
      .format(d)
      .replace('.', ''),
    dayNum: new Intl.DateTimeFormat('en-US', { timeZone: ONE_ON_ONE_TIMEZONE, day: 'numeric' }).format(d),
    month: new Intl.DateTimeFormat('es-US', { timeZone: ONE_ON_ONE_TIMEZONE, month: 'short' })
      .format(d)
      .replace('.', ''),
  };
}

export function groupSlotsByFloridaDate<T extends { startAt: string }>(
  slots: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const s of slots) {
    const key = floridaDateKey(s.startAt);
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  for (const list of Array.from(map.values())) {
    list.sort((a: T, b: T) => a.startAt.localeCompare(b.startAt));
  }
  return map;
}