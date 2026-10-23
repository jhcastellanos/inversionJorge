import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { PlatformAcademyLesson, type LessonType } from '../../../../../lib/platformAcademy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: LessonType[] = ['video', 'pdf', 'link'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  const patch: Parameters<typeof PlatformAcademyLesson.update>[1] = {};
  if (typeof body.lesson_code === 'string') patch.lesson_code = body.lesson_code;
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if (typeof body.lesson_type === 'string' && TYPES.includes(body.lesson_type as LessonType)) {
    patch.lesson_type = body.lesson_type as LessonType;
  }
  if (body.file_url === null) patch.file_url = null;
  else if (typeof body.file_url === 'string') patch.file_url = body.file_url;
  if (typeof body.duration_label === 'string') patch.duration_label = body.duration_label;
  if (typeof body.file_size_bytes === 'number') patch.file_size_bytes = body.file_size_bytes;
  if (typeof body.sort_order === 'number') patch.sort_order = body.sort_order;
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
  const row = await PlatformAcademyLesson.update(id, patch);
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ lesson: row });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  await PlatformAcademyLesson.delete(id);
  return NextResponse.json({ ok: true });
}
