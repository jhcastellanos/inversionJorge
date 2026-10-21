import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../lib/memberAuth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { getMemberAccess } from '../../../../lib/memberAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await PlatformUser.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const access = await getMemberAccess(user);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      onboarding_completed: user.onboarding_completed,
      stripe_customer_id: user.stripe_customer_id,
    },
    access,
  });
}
