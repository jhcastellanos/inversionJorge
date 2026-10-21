import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/auth';
import { PlatformClass } from '../../../../lib/platformContent';
import type { ClassLevel } from '../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLASS_LEVELS: ClassLevel[] = ['basico', 'avanzado'];

function parseClassLevel(v: unknown): ClassLevel | null {
  return typeof v === 'string' && CLASS_LEVELS.includes(v as ClassLevel) ? (v as ClassLevel) : null;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await PlatformClass.findAllAdmin();
  return NextResponse.json({ classes: rows });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const class_level = parseClassLevel(body.class_level);
  if (!title || !class_level) {
    return NextResponse.json({ error: 'title y class_level requeridos' }, { status: 400 });
  }
  const row = await PlatformClass.create({
    title,
    class_level,
    description: typeof body.description === 'string' ? body.description : undefined,
    section_name: typeof body.section_name === 'string' ? body.section_name : undefined,
    video_url: typeof body.video_url === 'string' ? body.video_url : null,
    sort_order: typeof body.sort_order === 'number' ? body.sort_order : undefined,
    is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
  });
  return NextResponse.json({ class: row }, { status: 201 });
}
