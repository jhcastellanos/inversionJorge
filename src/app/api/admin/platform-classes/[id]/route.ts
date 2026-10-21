import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../../lib/auth';
import { PlatformClass } from '../../../../../lib/platformContent';
import type { ClassLevel } from '../../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLASS_LEVELS: ClassLevel[] = ['basico', 'avanzado'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  const patch: Parameters<typeof PlatformClass.update>[1] = {};
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (typeof body.section_name === 'string') patch.section_name = body.section_name;
  if (typeof body.class_level === 'string' && CLASS_LEVELS.includes(body.class_level as ClassLevel)) {
    patch.class_level = body.class_level as ClassLevel;
  }
  if (typeof body.video_url === 'string' || body.video_url === null) patch.video_url = body.video_url;
  if (typeof body.sort_order === 'number') patch.sort_order = body.sort_order;
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;

  const row = await PlatformClass.update(id, patch);
  if (!row) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  return NextResponse.json({ class: row });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  await PlatformClass.delete(id);
  return NextResponse.json({ ok: true });
}
