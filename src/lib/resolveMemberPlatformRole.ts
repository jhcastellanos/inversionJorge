import {
  MEMBERSHIP_INACTIVE_PLATFORM_ROLE,
  MEMBERSHIP_ACTIVE_PLATFORM_ROLE,
  type PlatformRole,
} from './platformRoles';

/** Combina membresía Trader (Stripe) + paquete Estudiante vigentes. */
export function resolveAutomatedMembershipRole(
  subscriptionActive: boolean,
  alumnoAccessActive: boolean
): PlatformRole {
  if (subscriptionActive && alumnoAccessActive) return 'trader_alumno';
  if (subscriptionActive) return MEMBERSHIP_ACTIVE_PLATFORM_ROLE;
  if (alumnoAccessActive) return 'alumno';
  return MEMBERSHIP_INACTIVE_PLATFORM_ROLE;
}