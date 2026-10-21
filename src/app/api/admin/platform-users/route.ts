import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { PlatformUser } from '../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  const users = await PlatformUser.findAll();
  return NextResponse.json({
    users,
    staff: {
      platformRole: staff.platformRole,
      capabilities: staff.capabilities,
    },
  });
}
