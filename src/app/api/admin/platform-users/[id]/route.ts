import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { PlatformUser } from '../../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaffApi(req, { requireDeleteUsers: true });
  if (staff instanceof NextResponse) return staff;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const deleted = await PlatformUser.deleteById(userId);
  if (!deleted) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
