import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from './auth';
import { getMemberFromRequest, verifyMemberJwt, MEMBER_COOKIE } from './memberAuth';
import { PlatformUser } from './platformUsers';
import {
  getStaffCapabilities,
  isPlatformStaffRole,
  parsePlatformRole,
  type PlatformRole,
  type StaffCapabilities,
} from './platformRoles';

export type StaffContext = {
  source: 'admin_jwt' | 'platform_user';
  platformRole: PlatformRole;
  capabilities: StaffCapabilities;
};

export async function getStaffFromRequest(req: NextRequest): Promise<StaffContext | null> {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (adminToken && verifyJwt(adminToken)) {
    return {
      source: 'admin_jwt',
      platformRole: 'admin',
      capabilities: getStaffCapabilities('admin'),
    };
  }

  const member = getMemberFromRequest(req);
  if (!member) return null;

  const user = await PlatformUser.findById(member.userId);
  if (!user) return null;

  const role = parsePlatformRole(user.platform_role);
  if (!isPlatformStaffRole(role)) return null;

  return {
    source: 'platform_user',
    platformRole: role!,
    capabilities: getStaffCapabilities(role!),
  };
}

export async function getStaffFromCookies(): Promise<StaffContext | null> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  if (adminToken && verifyJwt(adminToken)) {
    return {
      source: 'admin_jwt',
      platformRole: 'admin',
      capabilities: getStaffCapabilities('admin'),
    };
  }

  const memberToken = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = memberToken ? verifyMemberJwt(memberToken) : null;
  if (!session) return null;

  const user = await PlatformUser.findById(session.userId);
  if (!user) return null;

  const role = parsePlatformRole(user.platform_role);
  if (!isPlatformStaffRole(role)) return null;

  return {
    source: 'platform_user',
    platformRole: role!,
    capabilities: getStaffCapabilities(role!),
  };
}

export async function requireStaffApi(
  req: NextRequest,
  options?: { requireManageContent?: boolean; requireDeleteUsers?: boolean }
): Promise<StaffContext | NextResponse> {
  const staff = await getStaffFromRequest(req);
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (options?.requireManageContent && !staff.capabilities.canManagePlatformContent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (options?.requireDeleteUsers && !staff.capabilities.canDeletePlatformUsers) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return staff;
}

export async function requireStaffPage(options?: { requireManageContent?: boolean }) {
  const staff = await getStaffFromCookies();
  if (!staff) redirect('/admin/login');
  if (options?.requireManageContent && !staff.capabilities.canManagePlatformContent) {
    redirect('/admin/dashboard');
  }
  return staff;
}
