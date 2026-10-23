import type { PlatformCalendarEventRow } from './platformContent';
import type { MemberAccessInfo } from './memberAccess';
import { canAccessLiveEvent, tierFromLegacy } from './liveEventAccess';
import {
  parseEventKind,
  parseLiveEventTier,
  type EventKind,
  type EventLevel,
  type LiveEventTier,
} from './platformRoles';

const DISPLAY_TZ = 'America/New_York';

/** Ventana en vivo por defecto cuando no hay `ends_at` en base de datos. */
export const DEFAULT_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;
export const DEFAULT_EVENT_DURATION_MINUTES = 120;

export type EventLiveTiming = {
  starts_at: Date | string;
  ends_at?: Date | string | null;
  force_live?: boolean | null;
  suppress_live?: boolean | null;
};

export function resolveEventEndsAt(event: EventLiveTiming): Date {
  const start = new Date(event.starts_at);
  if (event.ends_at) return new Date(event.ends_at);
  return new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
}

export function isEventLiveBySchedule(event: EventLiveTiming, now = new Date()): boolean {
  const start = new Date(event.starts_at);
  const end = resolveEventEndsAt(event);
  return start <= now && now <= end;
}

/** En vivo en inicio/CRM: horario, manual (force_live) o no si suppress_live. Siempre termina al llegar `ends_at`. */
export function isEventLive(event: EventLiveTiming, now = new Date()): boolean {
  if (event.suppress_live) return false;
  const end = resolveEventEndsAt(event);
  if (now > end) return false;
  if (event.force_live) return true;
  return isEventLiveBySchedule(event, now);
}

export function isEventUpcoming(event: EventLiveTiming, now = new Date()): boolean {
  if (isEventLive(event, now)) return false;
  return new Date(event.starts_at) > now;
}

export function resolveEventTier(row: PlatformCalendarEventRow): LiveEventTier {
  if (row.event_tier) return parseLiveEventTier(row.event_tier);
  return tierFromLegacy(row.event_level, row.event_kind);
}

export function filterEventsByMemberAccess(
  events: PlatformCalendarEventRow[],
  access: Pick<MemberAccessInfo, 'hasAccess' | 'subscriptionActive' | 'permissions' | 'role'>,
  options?: { adminSeeAll?: boolean }
) {
  return events.filter((e) => {
    if (options?.adminSeeAll && access.role === 'admin') return true;
    return canAccessLiveEvent(access, resolveEventTier(e));
  });
}

/** @deprecated usar filterEventsByMemberAccess */
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
  zoom_url: string | null;
  event_kind: EventKind;
  event_level: EventLevel;
  event_tier: LiveEventTier;
  starts_at: string;
  ends_at: string | null;
  is_published: boolean;
  force_live: boolean;
  suppress_live: boolean;
};

export function getEventJoinUrl(ev: {
  zoom_url?: string | null;
  description?: string | null;
}): string | null {
  const zoom = ev.zoom_url?.trim();
  if (zoom && /^https?:\/\//i.test(zoom)) return zoom;
  const desc = ev.description?.trim();
  if (desc?.startsWith('http')) return desc.split(/\s/)[0];
  return null;
}

export function eventDurationMinutes(startsAt: Date, endsAt: Date | null): number {
  if (endsAt) {
    const mins = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
    return mins > 0 ? mins : DEFAULT_EVENT_DURATION_MINUTES;
  }
  return DEFAULT_EVENT_DURATION_MINUTES;
}

export function formatEventAdminMeta(startsAt: Date, endsAt: Date | null) {
  const datePart = startsAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: DISPLAY_TZ,
  });
  const mins = eventDurationMinutes(startsAt, endsAt);
  return `${datePart} EST · ${mins} min`;
}

/** Valor para input datetime-local en hora local del navegador */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function serializeEvent(row: PlatformCalendarEventRow): SerializedEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    zoom_url: row.zoom_url ?? null,
    event_kind: parseEventKind(row.event_kind),
    event_level: row.event_level,
    event_tier: resolveEventTier(row),
    starts_at: new Date(row.starts_at).toISOString(),
    ends_at: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    is_published: row.is_published,
    force_live: Boolean(row.force_live),
    suppress_live: Boolean(row.suppress_live),
  };
}
