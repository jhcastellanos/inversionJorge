import { NextRequest, NextResponse } from 'next/server';
import { comparePassword } from '../../../../lib/auth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { getMemberAccess } from '../../../../lib/memberAccess';
import { signMemberJwt, MEMBER_COOKIE, memberCookieOptions } from '../../../../lib/memberAuth';

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

    const access = await getMemberAccess(user);
    const token = signMemberJwt({ userId: user.id, email: user.email });
    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, full_name: user.full_name },
      access,
    });
    res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions());
    return res;
  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
