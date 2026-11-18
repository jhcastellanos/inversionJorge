import {
  ONE_ON_ONE_MIN_LEAD_HOURS,
  ONE_ON_ONE_SLOT_HOURS,
  ONE_ON_ONE_TIMEZONE,
  ONE_ON_ONE_TIMEZONE_LABEL,
} from './oneOnOneMeetings.constants';

export type BookableSlot = {
  /** ISO UTC */
  startAt: string;
  /** Etiqueta legible en zona local */
  label: string;
  weekdayLabel: string;
};

function formatPartsInTimeZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('es-MX', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    weekday: get('weekday').toLowerCase(),
  };
}

/** Construye Date UTC a partir de calendario local en `timeZone`. */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string = ONE_ON_ONE_TIMEZONE
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const asUtc = new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' }));
  const asTz = new Date(guess.toLocaleString('en-US', { timeZone }));
  const offsetMs = asUtc.getTime() - asTz.getTime();
  return new Date(guess.getTime() + offsetMs);
}

function addDaysUtc(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function localDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Slots L–V 12:00–20:00 (zona ONE_ON_ONE_TIMEZONE), mínimo 24 h de antelación. */
export function listBookableSlots(options?: {
  daysAhead?: number;
  timeZone?: string;
  now?: Date;
}): BookableSlot[] {
  const timeZone = options?.timeZone ?? ONE_ON_ONE_TIMEZONE;
  const now = options?.now ?? new Date();
  const daysAhead = options?.daysAhead ?? 21;
  const minStart = now.getTime() + ONE_ON_ONE_MIN_LEAD_HOURS * 60 * 60 * 1000;

  const slots: BookableSlot[] = [];
  const seen = new Set<string>();

  let cursor = new Date(now);
  cursor.setUTCHours(0, 0, 0, 0);

  for (let offset = 0; offset <= daysAhead; offset++) {
    const day = addDaysUtc(cursor, offset);
    const { year, month, day: dom } = formatPartsInTimeZone(day, timeZone);
    const weekdayEn = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })
      .format(day)
      .toLowerCase();
    const isWeekday = !weekdayEn.startsWith('sat') && !weekdayEn.startsWith('sun');
    if (!isWeekday) continue;

    for (const hour of ONE_ON_ONE_SLOT_HOURS) {
      const start = zonedLocalToUtc(year, month, dom, hour, 0, timeZone);
      if (start.getTime() < minStart) continue;

      const key = start.toISOString();
      if (seen.has(key)) continue;
      seen.add(key);

      const label = new Intl.DateTimeFormat('es-US', {
        timeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(start);

      const timeOnly = new Intl.DateTimeFormat('es-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
      }).format(start);

      const weekdayEs = new Intl.DateTimeFormat('es-US', { timeZone, weekday: 'long' }).format(start);

      slots.push({
        startAt: key,
        label: `${label} (${ONE_ON_ONE_TIMEZONE_LABEL})`,
        weekdayLabel: `${weekdayEs} ${dom}/${month} · ${timeOnly}`,
      });
    }
  }

  return slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function parseSlotIso(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isAllowedBookableSlot(start: Date, now = new Date()): boolean {
  const minStart = now.getTime() + ONE_ON_ONE_MIN_LEAD_HOURS * 60 * 60 * 1000;
  if (start.getTime() < minStart) return false;

  const { hour } = formatPartsInTimeZone(start, ONE_ON_ONE_TIMEZONE);
  if (!(ONE_ON_ONE_SLOT_HOURS as readonly number[]).includes(hour)) return false;

  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: ONE_ON_ONE_TIMEZONE,
    weekday: 'short',
  })
    .format(start)
    .toLowerCase();
  if (weekday.startsWith('sat') || weekday.startsWith('sun')) return false;

  return true;
}