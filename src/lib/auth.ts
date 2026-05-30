import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is not configured (must be set and at least 16 characters).');
  }
  return secret;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: object) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

/**
 * Validates the admin session from the request cookies.
 * Returns true only when a properly signed admin token is present.
 */
export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return false;
  return verifyJwt(token) !== null;
}
