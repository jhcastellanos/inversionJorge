import { NextRequest, NextResponse } from 'next/server';
import { AdminUser } from '../../../../lib/models';
import { comparePassword, signJwt } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }

    const user = await AdminUser.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Usa /admin/login (no /login de miembros).' },
        { status: 401 }
      );
    }
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = signJwt({ userId: user.id, username: user.username });

    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error('Admin login error:', err);
    const message =
      err instanceof Error && err.message.includes('JWT_SECRET')
        ? 'JWT_SECRET no configurado en el servidor'
        : 'Error del servidor al iniciar sesión';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
