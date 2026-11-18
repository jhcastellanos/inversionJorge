import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import { PlatformUser } from '../../../../../lib/platformUsers';
import { userHasActiveAlumnoAccess } from '../../../../../lib/memberAlumnoAccess';
import {
  getAlumnoPackageDisplayPriceUsd,
  isAlumnoPackageCheckoutEnabled,
  ALUMNO_PACKAGE_DEFAULT_TITLE,
  ALUMNO_PACKAGE_ACCESS_YEARS,
} from '../../../../../lib/alumnoPackageConfig';
import { ensurePlatformUserAlumnoSchema } from '../../../../../lib/platformUserAlumnoSchema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensurePlatformUserAlumnoSchema();
  const user = await PlatformUser.findById(session.userId);
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const active = userHasActiveAlumnoAccess(user);
  const until = user.alumno_access_until
    ? new Date(user.alumno_access_until).toISOString()
    : null;

  return NextResponse.json({
    checkoutEnabled: isAlumnoPackageCheckoutEnabled(),
    title: ALUMNO_PACKAGE_DEFAULT_TITLE,
    accessYears: ALUMNO_PACKAGE_ACCESS_YEARS,
    displayPriceUsd: getAlumnoPackageDisplayPriceUsd(),
    accessActive: active,
    accessUntil: until,
  });
}