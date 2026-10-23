import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { PlatformCalendarEvent } from '../../../../../lib/platformContent';
import {
  legacyFieldsFromEventTier,
  parseEventKind,
  parseLiveEventTier,
  type EventLevel,
} from '../../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_LEVELS: EventLevel[] = ['basico', 'medio', 'avanzado'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  const patch: Parameters<typeof PlatformCalendarEvent.update>[1] = {};
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (body.zoom_url === null) patch.zoom_url = null;
  else if (typeof body.zoom_url === 'string') patch.zoom_url = body.zoom_url.trim() || null;
  if (typeof body.event_level === 'string' && EVENT_LEVELS.includes(body.event_level as EventLevel)) {
    patch.event_level = body.event_level as EventLevel;
  }
  if (body.event_kind !== undefined) {
    patch.event_kind = parseEventKind(body.event_kind);
  }
  if (body.event_tier !== undefined) {
    const tier = parseLiveEventTier(body.event_tier);
    patch.event_tier = tier;
    const legacy = legacyFieldsFromEventTier(tier);
    patch.event_kind = legacy.event_kind;
    patch.event_level = legacy.event_level;
  }
  if (body.starts_at) {
    const d = new Date(body.starts_at);
    if (!Number.isNaN(d.getTime())) patch.starts_at = d;
  }
  if (body.ends_at === null) patch.ends_at = null;
  else if (body.ends_at) {
    const d = new Date(body.ends_at);
    if (!Number.isNaN(d.getTime())) patch.ends_at = d;
  }
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
  if (typeof body.force_live === 'boolean') patch.force_live = body.force_live;

  const row = await PlatformCalendarEvent.update(id, patch);
  if (!row) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  return NextResponse.json({ event: row });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  await PlatformCalendarEvent.delete(id);
  return NextResponse.json({ ok: true });
}
