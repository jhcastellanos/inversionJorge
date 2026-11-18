import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../lib/staffAccess';
import { SupportTicket } from '../../../../../lib/supportTickets';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import { PlatformUser } from '../../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, context: RouteContext) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  const user = await PlatformUser.findById(ticket.user_id);
  const fresh = ticket.status === 'open' ? await SupportTicket.markRead(id) : ticket;

  return NextResponse.json({
    ticket: fresh ?? ticket,
    user: user
      ? { email: user.email, full_name: user.full_name }
      : null,
    isAnonymous: ticket.is_anonymous,
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await req.json();
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'mark_read') {
    const ticket = await SupportTicket.markRead(id);
    if (!ticket) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  }

  if (action === 'respond') {
    const response = typeof body.response === 'string' ? body.response.trim() : '';
    if (!response || response.length < 2) {
      return NextResponse.json({ error: 'Escribe una respuesta' }, { status: 400 });
    }

    const member = staff.source === 'platform_user' ? getMemberFromRequest(req) : null;
    const adminUserId = member?.userId ?? null;

    const ticket = await SupportTicket.respond(id, adminUserId, response);
    if (!ticket) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}