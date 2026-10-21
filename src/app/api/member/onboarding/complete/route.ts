import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import { PlatformUser } from '../../../../../lib/platformUsers';
import { getMemberAccess } from '../../../../../lib/memberAccess';

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

  const access = await getMemberAccess(user);
  if (!access.hasAccess) {
    return NextResponse.json(
      { error: 'Necesitas una membresía activa para continuar' },
      { status: 403 }
    );
  }

  await PlatformUser.setOnboardingCompleted(user.id, true);
  return NextResponse.json({ success: true });
}
