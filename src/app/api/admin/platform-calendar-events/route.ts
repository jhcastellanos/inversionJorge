import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformCalendarEvent } from '../../../../lib/platformContent';
import type { EventLevel } from '../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_LEVELS: EventLevel[] = ['basico', 'medio', 'avanzado'];

function parseEventLevel(v: unknown): EventLevel | null {
  return typeof v === 'string' && EVENT_LEVELS.includes(v as EventLevel) ? (v as EventLevel) : null;
}

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const rows = await PlatformCalendarEvent.findAllAdmin();
  return NextResponse.json({ events: rows });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const event_level = parseEventLevel(body.event_level);
  const starts_at = body.starts_at ? new Date(body.starts_at) : null;
  if (!title || !event_level || !starts_at || Number.isNaN(starts_at.getTime())) {
    return NextResponse.json({ error: 'title, event_level y starts_at requeridos' }, { status: 400 });
  }
  const ends_at = body.ends_at ? new Date(body.ends_at) : null;
  const row = await PlatformCalendarEvent.create({
    title,
    event_level,
    starts_at,
    ends_at: ends_at && !Number.isNaN(ends_at.getTime()) ? ends_at : null,
    description: typeof body.description === 'string' ? body.description : undefined,
    is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
  });
  return NextResponse.json({ event: row }, { status: 201 });
}
