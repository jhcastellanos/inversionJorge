import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformAcademyModule } from '../../../../lib/platformAcademy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const modules = await PlatformAcademyModule.findAllAdminWithLessons();
  return NextResponse.json({ modules });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return NextResponse.json({ error: 'title requerido' }, { status: 400 });
  }
  const row = await PlatformAcademyModule.create({
    title,
    description: typeof body.description === 'string' ? body.description : null,
    sort_order: typeof body.sort_order === 'number' ? body.sort_order : undefined,
    is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
  });
  return NextResponse.json({ module: row }, { status: 201 });
}
