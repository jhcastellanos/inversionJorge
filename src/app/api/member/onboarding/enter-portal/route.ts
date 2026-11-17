import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import { canEnterMemberPortal, getMemberAccess } from '../../../../../lib/memberAccess';
import { PlatformUser } from '../../../../../lib/platformUsers';
import { parsePlatformRole, PLATFORM_ROLE_LABELS } from '../../../../../lib/platformRoles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await PlatformUser.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const roleFromDb = parsePlatformRole(user.platform_role);
  if (!canEnterMemberPortal(roleFromDb)) {
    return NextResponse.json(
      {
        error:
          'Aún no tienes un rol asignado en la plataforma. Contacta a soporte para que activen tu acceso.',
        hasRole: false,
      },
      { status: 403 }
    );
  }

  const access = await getMemberAccess(user);
  if (!access.hasAccess || !canEnterMemberPortal(access.effectiveRole)) {
    return NextResponse.json(
      {
        error: 'No se pudo confirmar tu rol. Intenta de nuevo en unos segundos.',
        hasRole: false,
      },
      { status: 403 }
    );
  }

  await PlatformUser.setOnboardingCompleted(user.id, true);

  return NextResponse.json({
    ok: true,
    role: access.effectiveRole,
    roleLabel: access.effectiveRole ? PLATFORM_ROLE_LABELS[access.effectiveRole] : null,
  });
}