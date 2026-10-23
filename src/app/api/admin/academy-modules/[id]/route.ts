import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { PlatformAcademyModule } from '../../../../../lib/platformAcademy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  const patch: Parameters<typeof PlatformAcademyModule.update>[1] = {};
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (body.description === null) patch.description = null;
  if (typeof body.sort_order === 'number') patch.sort_order = body.sort_order;
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
  const row = await PlatformAcademyModule.update(id, patch);
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ module: row });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffApi(req, { requireManageContent: true });
  if (staff instanceof NextResponse) return staff;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  await PlatformAcademyModule.delete(id);
  return NextResponse.json({ ok: true });
}
