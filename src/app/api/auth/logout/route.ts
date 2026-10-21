import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function clearAdminCookie(res: NextResponse) {
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

/** Cierre de sesión del panel admin (form POST desde AdminNav) */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303);
  return clearAdminCookie(res);
}

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303);
  return clearAdminCookie(res);
}
