import type { PlatformUserRow } from './platformUsers';
import {
  getPermissionsForRole,
  parsePlatformRole,
  getContentAccessForRole,
  type PlatformPermissions,
  type PlatformRole,
  type ContentAccess,
} from './platformRoles';
import {
  getActiveSubscriptionInfo,
  syncPlatformRoleWithSubscription,
} from './memberSubscriptionSync';

export type { ContentAccess };

export type MemberAccessInfo = {
  hasAccess: boolean;
  subscriptions: Array<{
    membershipName: string;
    status: string;
    stripeSubscriptionId: string;
  }>;
  source: 'database' | 'stripe' | 'role' | 'none';
  role: PlatformRole | null;
  effectiveRole: PlatformRole | null;
  permissions: PlatformPermissions;
  contentAccess: ContentAccess;
  subscriptionActive: boolean;
  /** Estudiante con membresía activa: pedir a soporte actualizar rol */
  contactSupportForRoleUpgrade: boolean;
};

export async function getMemberAccess(user: PlatformUserRow): Promise<MemberAccessInfo> {
  const subInfo = await getActiveSubscriptionInfo(user);
  const userSynced = await syncPlatformRoleWithSubscription(user, subInfo.active);

  const role = parsePlatformRole(userSynced.platform_role);
  const permissions = getPermissionsForRole(role);

  const hasRoleAccess =
    role !== null && (permissions.alumno || permissions.admin || permissions.soporte);

  /** Sin rol y sin suscripción activa → onboarding */
  const hasAccess = hasRoleAccess;

  let source: MemberAccessInfo['source'] = 'none';
  if (hasRoleAccess) source = 'role';
  else if (subInfo.active) source = subInfo.source;

  const effectiveRole: PlatformRole | null = role;

  const contactSupportForRoleUpgrade =
    role === 'alumno' && subInfo.active;

  return {
    hasAccess,
    subscriptions: subInfo.subscriptions,
    source,
    role,
    effectiveRole,
    permissions,
    contentAccess: getContentAccessForRole(effectiveRole),
    subscriptionActive: subInfo.active,
    contactSupportForRoleUpgrade,
  };
}
