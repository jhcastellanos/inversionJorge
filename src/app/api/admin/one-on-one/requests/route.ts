import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { OneOnOneRequest, ensureOneOnOneSchema } from '../../../../../lib/oneOnOneMeetings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  await ensureOneOnOneSchema();
  const requests = await OneOnOneRequest.listForAdmin();
  const pending = requests.filter((r) => r.status === 'pending_admin').length;
  return NextResponse.json({ requests, pendingCount: pending });
}