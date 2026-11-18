import { NextResponse } from 'next/server';
import { parsePlatformRole } from './platformRoles';
import { PlatformUser } from './platformUsers';

/** Las cuentas con rol Admin gestionan 1-a-1 desde el panel, no las solicitan como miembro. */
export function canMemberRequestOneOnOne(platformRole: string | null | undefined): boolean {
  const role = parsePlatformRole(platformRole ?? null);
  return role !== 'admin';
}

export async function assertMemberCanRequestOneOnOne(userId: number): Promise<NextResponse | null> {
  const user = await PlatformUser.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (!canMemberRequestOneOnOne(user.platform_role)) {
    return NextResponse.json(
      {
        error: 'Las cuentas Admin no pueden solicitar reuniones 1-a-1. Usa el panel de administración.',
        code: 'ADMIN_CANNOT_REQUEST_ONE_ON_ONE',
      },
      { status: 403 }
    );
  }
  return null;
}