import { NextRequest, NextResponse } from 'next/server';
import { AdminUser } from '../../../../lib/models';
import { comparePassword, signJwt } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = await AdminUser.findByUsername(username);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const token = signJwt({ userId: user.id, username: user.username });
  
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  
  return res;
}
