import { NextRequest, NextResponse } from 'next/server';
import { comparePassword } from '../../../../lib/auth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { getMemberAccess } from '../../../../lib/memberAccess';
import { signMemberJwt, MEMBER_COOKIE, memberCookieOptions } from '../../../../lib/memberAuth';
import { ensurePlatformUserDiscordSchema } from '../../../../lib/platformUserDiscordSchema';
import { userHasDiscordLinked } from '../../../../lib/memberDiscordGate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const user = await PlatformUser.findByEmail(email);
    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    await ensurePlatformUserDiscordSchema();
    const fresh = (await PlatformUser.findById(user.id)) ?? user;
    const access = await getMemberAccess(fresh);
    const token = signMemberJwt({ userId: fresh.id, email: fresh.email });
    const res = NextResponse.json({
      success: true,
      user: { id: fresh.id, email: fresh.email, full_name: fresh.full_name },
      access,
      discordLinked: userHasDiscordLinked(fresh),
    });
    res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions());
    return res;
  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
