import type { NextRequest } from 'next/server';
import { signJwt, verifyJwt } from './auth';

export type MemberJwtPayload = {
  role: 'member';
  userId: number;
  email: string;
};

export function signMemberJwt(payload: Omit<MemberJwtPayload, 'role'>) {
  return signJwt({ ...payload, role: 'member' });
}

export function verifyMemberJwt(token: string): MemberJwtPayload | null {
  const decoded = verifyJwt(token);
  if (!decoded || typeof decoded !== 'object') return null;
  const payload = decoded as MemberJwtPayload;
  if (payload.role !== 'member' || !payload.userId || !payload.email) return null;
  return payload;
}

export function getMemberTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('member_token')?.value ?? null;
}

export function getMemberFromRequest(req: NextRequest): MemberJwtPayload | null {
  const token = getMemberTokenFromRequest(req);
  if (!token) return null;
  return verifyMemberJwt(token);
}

export function isMemberRequest(req: NextRequest): boolean {
  return getMemberFromRequest(req) !== null;
}

export const MEMBER_COOKIE = 'member_token';

export function memberCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}
