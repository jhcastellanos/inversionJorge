import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { signMemberJwt, MEMBER_COOKIE, memberCookieOptions } from '../../../../lib/memberAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existing = await PlatformUser.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const user = await PlatformUser.create({ email, full_name: fullName, password_hash });

    const token = signMemberJwt({ userId: user.id, email: user.email });
    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name } });
    res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions());
    return res;
  } catch (error) {
    console.error('Member register error:', error);
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 });
  }
}
