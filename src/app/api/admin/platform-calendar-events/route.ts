import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import { ensurePlatformCalendarEventSchema } from '../../../../lib/platformCalendarEventSchema';
import { DEFAULT_EVENT_DURATION_MS } from '../../../../lib/platformEventDisplay';
import {
  legacyFieldsFromEventTier,
  parseEventKind,
  parseLiveEventTier,
  type EventLevel,
} from '../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_LEVELS: EventLevel[] = ['basico', 'medio', 'avanzado'];

function parseEventLevel(v: unknown): EventLevel | null {
  return typeof v === 'string' && EVENT_LEVELS.includes(v as EventLevel) ? (v as EventLevel) : null;
}

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  await ensurePlatformCalendarEventSchema();
  const rows = await PlatformCalendarEvent.findAllAdmin();
  return NextResponse.json({ events: rows });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const event_tier = parseLiveEventTier(body.event_tier ?? body.event_level);
  const legacy = legacyFieldsFromEventTier(event_tier);
  const event_level = parseEventLevel(body.event_level) ?? legacy.event_level;
  const starts_at = body.starts_at ? new Date(body.starts_at) : null;
  if (!title || !starts_at || Number.isNaN(starts_at.getTime())) {
    return NextResponse.json({ error: 'title, event_tier y starts_at requeridos' }, { status: 400 });
  }
  let ends_at = body.ends_at ? new Date(body.ends_at) : null;
  if (!ends_at || Number.isNaN(ends_at.getTime())) {
    ends_at = new Date(starts_at.getTime() + DEFAULT_EVENT_DURATION_MS);
  }
  const zoom_url =
    typeof body.zoom_url === 'string' && body.zoom_url.trim()
      ? body.zoom_url.trim()
      : null;

  const event_kind = body.event_kind ? parseEventKind(body.event_kind) : legacy.event_kind;

  try {
    await ensurePlatformCalendarEventSchema();
    const row = await PlatformCalendarEvent.create({
      title,
      event_kind,
      event_level: event_level ?? legacy.event_level,
      event_tier,
      starts_at,
      ends_at,
      description: typeof body.description === 'string' ? body.description : undefined,
      zoom_url,
      is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
      force_live: typeof body.force_live === 'boolean' ? body.force_live : undefined,
      suppress_live: typeof body.suppress_live === 'boolean' ? body.suppress_live : undefined,
    });
    return NextResponse.json({ event: row }, { status: 201 });
  } catch (err) {
    console.error('platform-calendar-events POST failed:', err);
    const detail = err instanceof Error ? err.message : 'Unknown error';
    const isSchema =
      /column|relation|does not exist/i.test(detail) ||
      /DATABASE_URL/i.test(detail);
    const message = isSchema
      ? `No se pudo actualizar el esquema de eventos en Neon. Detalle: ${detail}. En el SQL Editor de Neon ejecuta: ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS zoom_url TEXT; ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva'; ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS force_live BOOLEAN DEFAULT false; (usa la misma base que DATABASE_URL en Vercel, preferible conexión directa sin -pooler).`
      : `Error al crear evento: ${detail}`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
