import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../lib/staffAccess';
import { SupportTicket } from '../../../../lib/supportTickets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  const tickets = await SupportTicket.listForAdmin();
  const openCount = await SupportTicket.countOpen();
  return NextResponse.json({ tickets, openCount });
}