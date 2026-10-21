import type { PlatformCalendarEventRow } from './platformContent';
import type { EventLevel } from './platformRoles';

const DISPLAY_TZ = 'America/New_York';

export function isEventLive(event: PlatformCalendarEventRow, now = new Date()): boolean {
  const start = new Date(event.starts_at);
  const end = event.ends_at
    ? new Date(event.ends_at)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return start <= now && now <= end;
}

export function isEventUpcoming(event: PlatformCalendarEventRow, now = new Date()): boolean {
  return new Date(event.starts_at) > now;
}

export function filterEventsByAccess(
  events: PlatformCalendarEventRow[],
  canAccess: (level: EventLevel) => boolean
) {
  return events.filter((e) => canAccess(e.event_level));
}

export function splitLiveAndUpcoming(events: PlatformCalendarEventRow[], now = new Date()) {
  const live = events.filter((e) => isEventLive(e, now));
  const upcoming = events.filter((e) => isEventUpcoming(e, now));
  return { live, upcoming };
}

export function formatEventDayShort(date: Date) {
  const day = date.toLocaleDateString('en-US', { day: '2-digit', timeZone: DISPLAY_TZ });
  const month = date
    .toLocaleDateString('en-US', { month: 'short', timeZone: DISPLAY_TZ })
    .toUpperCase()
    .replace('.', '');
  return { day, month };
}

export function formatEventLine(date: Date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: DISPLAY_TZ });
  const monthDay = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: DISPLAY_TZ,
  });
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: DISPLAY_TZ,
  });
  return `${weekday}, ${monthDay} • ${time} ET`;
}

export function greetingForNow(now = new Date()) {
  const hour = Number(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: DISPLAY_TZ })
  );
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function headerDateLine(now = new Date()) {
  return now
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: DISPLAY_TZ,
    })
    .toUpperCase();
}

export type SerializedEvent = {
  id: number;
  title: string;
  description: string | null;
  event_level: EventLevel;
  starts_at: string;
  ends_at: string | null;
  is_published: boolean;
};

export function serializeEvent(row: PlatformCalendarEventRow): SerializedEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    event_level: row.event_level,
    starts_at: new Date(row.starts_at).toISOString(),
    ends_at: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    is_published: row.is_published,
  };
}
