import { safeMemberNextPath } from './memberDiscordGate';

export const MEMBER_AUTH_NEXT_COOKIE = 'member_auth_next';

/** Tras login/registro: ruta segura o flujo estándar del portal. */
export function postAuthDestination(returnTo?: string | null): string {
  const safe = safeMemberNextPath(returnTo);
  return safe ?? '/onboarding';
}

/** Ruta sin Discord vinculado. */
export function discordLinkDestination(returnTo?: string | null): string {
  const safe = safeMemberNextPath(returnTo);
  if (!safe) return '/conectar-discord';
  const pathname = safe.split('?')[0];
  if (pathname === '/conectar-discord') return safe;
  return `/conectar-discord?next=${encodeURIComponent(safe)}`;
}

/** Obliga registro/login antes de continuar (p. ej. planes o post-pago). */
export function signupUrlForEnrollment(returnTo: string): string {
  const safe = safeMemberNextPath(returnTo) ?? '/planes';
  return `/?register=1&returnTo=${encodeURIComponent(safe)}`;
}