import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../lib/memberAuth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { ensurePlatformUserDiscordSchema } from '../../../../lib/platformUserDiscordSchema';
import { userHasDiscordLinked } from '../../../../lib/memberDiscordGate';
import { createAlumnoPackageCheckoutSession } from '../../../../lib/alumnoPackageStripe';
import { isAlumnoPackageCheckoutEnabled } from '../../../../lib/alumnoPackageConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const member = getMemberFromRequest(req);
  if (!member) {
    return NextResponse.json(
      { error: 'Crea tu cuenta e inicia sesión antes de comprar.', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  if (!isAlumnoPackageCheckoutEnabled()) {
    return NextResponse.json(
      { error: 'El paquete cursos aún no está configurado (Stripe Price ID).' },
      { status: 503 }
    );
  }

  const user = await PlatformUser.findById(member.userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  await ensurePlatformUserDiscordSchema();
  const fresh = (await PlatformUser.findById(user.id)) ?? user;
  if (!userHasDiscordLinked(fresh)) {
    return NextResponse.json(
      {
        error: 'Debes vincular Discord antes de comprar.',
        code: 'DISCORD_REQUIRED',
        redirect: '/conectar-discord?next=/planes',
      },
      { status: 403 }
    );
  }

  try {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto');
    const { url } = await createAlumnoPackageCheckoutSession(member.userId, host, protocol);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al iniciar checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}