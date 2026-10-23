import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformAcademyLesson, type LessonType } from '../../../../lib/platformAcademy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: LessonType[] = ['video', 'pdf', 'link'];

export async function POST(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const body = await req.json();
  const module_id = Number(body.module_id);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const lesson_type = typeof body.lesson_type === 'string' ? body.lesson_type : '';
  if (!Number.isFinite(module_id) || !title || !TYPES.includes(lesson_type as LessonType)) {
    return NextResponse.json({ error: 'module_id, title y lesson_type requeridos' }, { status: 400 });
  }
  const row = await PlatformAcademyLesson.create({
    module_id,
    title,
    lesson_type: lesson_type as LessonType,
    lesson_code: typeof body.lesson_code === 'string' ? body.lesson_code : '1.1',
    file_url: typeof body.file_url === 'string' ? body.file_url : null,
    duration_label: typeof body.duration_label === 'string' ? body.duration_label : null,
    file_size_bytes: typeof body.file_size_bytes === 'number' ? body.file_size_bytes : null,
    sort_order: typeof body.sort_order === 'number' ? body.sort_order : undefined,
    is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
  });
  return NextResponse.json({ lesson: row }, { status: 201 });
}
