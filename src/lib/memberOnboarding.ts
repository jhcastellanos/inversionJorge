import type { MemberAccessInfo } from './memberAccess';
import type { PlatformUserRow } from './platformUsers';
import { PlatformUser } from './platformUsers';

/** Si ya tiene acceso (Stripe o rol), marca onboarding completo y evita la pantalla intermedia */
export async function syncOnboardingIfHasAccess(
  user: PlatformUserRow,
  access: MemberAccessInfo
): Promise<PlatformUserRow> {
  if (access.hasAccess && !user.onboarding_completed) {
    const updated = await PlatformUser.setOnboardingCompleted(user.id, true);
    return updated ?? { ...user, onboarding_completed: true };
  }
  return user;
}
