'use client';

import {
  REFERRAL_COOKIE_MAX_AGE_DAYS,
  REFERRAL_COOKIE_NAME,
  REFERRAL_STORAGE_KEY,
} from './referralConstants';

function setCookie(code: string) {
  const maxAge = REFERRAL_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function persistReferralCode(code: string) {
  const normalized = code.trim().toUpperCase();
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  } catch {
    // Storage may be unavailable in private mode
  }
  setCookie(normalized);
}

export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const fromSession = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    if (fromSession) return fromSession;
    const fromLocal = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    // ignore
  }

  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REFERRAL_COOKIE_NAME}=`));
  if (match) {
    return decodeURIComponent(match.split('=').slice(1).join('='));
  }
  return null;
}

export function clearStoredReferralCode() {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0`;
}
