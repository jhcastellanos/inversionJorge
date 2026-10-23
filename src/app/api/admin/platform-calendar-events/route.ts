import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import { ensurePlatformCalendarEventSchema } from '../../../../lib/platformCalendarEventSchema';
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
  const ends_at = body.ends_at ? new Date(body.ends_at) : null;
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
      ends_at: ends_at && !Number.isNaN(ends_at.getTime()) ? ends_at : null,
      description: typeof body.description === 'string' ? body.description : undefined,
      zoom_url,
      is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
      force_live: typeof body.force_live === 'boolean' ? body.force_live : undefined,
    });
    return NextResponse.json({ event: row }, { status: 201 });
  } catch (err) {
    console.error('platform-calendar-events POST failed:', err);
    const message =
      err instanceof Error && /column|relation|does not exist/i.test(err.message)
        ? 'Falta migración de base de datos (event_tier/zoom_url). Ejecuta scripts/run-platform-academy-migration.mjs en Neon.'
        : 'Error al crear evento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
