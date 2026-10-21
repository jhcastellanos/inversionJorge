import { NextResponse } from 'next/server';
import { MEMBER_COOKIE } from '../../../../lib/memberAuth';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(MEMBER_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
