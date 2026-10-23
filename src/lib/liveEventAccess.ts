import type { MemberAccessInfo } from './memberAccess';
import {
  parseLiveEventTier,
  type LiveEventTier,
} from './platformRoles';

export function canAccessLiveEvent(
  access: Pick<MemberAccessInfo, 'hasAccess' | 'subscriptionActive' | 'permissions' | 'role'>,
  tier: LiveEventTier
): boolean {
  if (!access.hasAccess) return false;
  if (access.role === 'admin' || access.role === 'soporte') return true;

  switch (tier) {
    case 'clase_retrospectiva':
      return access.permissions.alumno;
    case 'operativa_trading':
      return (
        access.subscriptionActive &&
        (access.permissions.trader || access.permissions.inversor)
      );
    case 'avanzado':
      return access.subscriptionActive && access.permissions.inversor;
    default:
      return false;
  }
}

export function tierFromLegacy(event_level: string, event_kind?: string): LiveEventTier {
  if (event_level === 'avanzado') return 'avanzado';
  if (event_level === 'medio' || event_kind === 'operativa_en_vivo') return 'operativa_trading';
  return parseLiveEventTier('clase_retrospectiva');
}
