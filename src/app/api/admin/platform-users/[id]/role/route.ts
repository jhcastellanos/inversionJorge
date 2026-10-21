import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../../../lib/auth';
import { PlatformUser } from '../../../../../../lib/platformUsers';
import { parsePlatformRole, PLATFORM_ROLES } from '../../../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await req.json();
  const roleRaw = body.platform_role;

  let role: string | null = null;
  if (roleRaw === null || roleRaw === '' || roleRaw === 'none') {
    role = null;
  } else {
    const parsed = parsePlatformRole(roleRaw);
    if (!parsed) {
      return NextResponse.json(
        { error: `Rol inválido. Usa: ${PLATFORM_ROLES.join(', ')}` },
        { status: 400 }
      );
    }
    role = parsed;
  }

  const updated = await PlatformUser.updatePlatformRole(userId, role);
  if (!updated) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: updated });
}
