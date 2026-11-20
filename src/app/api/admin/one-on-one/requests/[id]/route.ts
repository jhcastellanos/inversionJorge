import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApi } from '../../../../../../lib/staffAccess';
import {
  OneOnOneRequest,
  paymentDeadlineForMeetingStart,
} from '../../../../../../lib/oneOnOneMeetings';
import { isAllowedBookableSlot, parseSlotIso } from '../../../../../../lib/oneOnOneSlots';
import {
  sendOneOnOneAlternativesToMember,
  sendOneOnOneApprovedToMember,
} from '../../../../../../lib/oneOnOneMeetingEmails';
import { PlatformUser } from '../../../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, context: Ctx) {
  const staff = await requireStaffApi(req);
  if (staff instanceof NextResponse) return staff;

  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const request = await OneOnOneRequest.findById(id);
  if (!request) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const body = await req.json();
  const action = typeof body.action === 'string' ? body.action : '';
  const user = await PlatformUser.findById(request.user_id);

  if (action === 'approve') {
    if (request.status !== 'pending_admin') {
      return NextResponse.json({ error: 'Solo se aprueban solicitudes pendientes' }, { status: 400 });
    }
    const start = new Date(request.meeting_start_at);
    const deadline = paymentDeadlineForMeetingStart(start);
    if (deadline.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'No se puede aprobar: faltan menos de 3 h para el inicio (plazo de pago ya venció)' },
        { status: 400 }
      );
    }

    const updated = await OneOnOneRequest.updateStatus(id, {
      status: 'awaiting_payment',
      payment_deadline_at: deadline,
    });

    if (user && updated) {
      try {
        await sendOneOnOneApprovedToMember(
          user.email,
          user.full_name,
          start.toISOString(),
          deadline.toISOString(),
          id
        );
      } catch (emailErr) {
        console.error('[one-on-one] email aprobación no enviado:', emailErr);
      }
    }

    return NextResponse.json({ success: true, request: updated });
  }

  if (action === 'propose_alternatives') {
    if (request.status !== 'pending_admin') {
      return NextResponse.json({ error: 'Solo desde solicitud pendiente' }, { status: 400 });
    }

    const raw = Array.isArray(body.alternative_slots) ? body.alternative_slots : [];
    const slots: string[] = [];
    for (const item of raw) {
      if (typeof item !== 'string') continue;
      const d = parseSlotIso(item);
      if (!d || !isAllowedBookableSlot(d)) continue;
      if (await OneOnOneRequest.isSlotTaken(d, id)) continue;
      slots.push(d.toISOString());
    }

    if (slots.length === 0) {
      return NextResponse.json({ error: 'Agrega al menos un horario alternativo válido' }, { status: 400 });
    }

    const adminMessage = typeof body.admin_message === 'string' ? body.admin_message.trim() : null;

    const updated = await OneOnOneRequest.updateStatus(id, {
      status: 'awaiting_client_slot',
      alternative_slots: slots,
      admin_message: adminMessage,
    });

    if (user && updated) {
      try {
        await sendOneOnOneAlternativesToMember(
          user.email,
          user.full_name,
          slots,
          adminMessage,
          id
        );
      } catch (emailErr) {
        console.error('[one-on-one] email alternativas no enviado:', emailErr);
      }
    }

    return NextResponse.json({ success: true, request: updated });
  }

  if (action === 'decline') {
    const adminMessage = typeof body.admin_message === 'string' ? body.admin_message.trim() : null;
    const updated = await OneOnOneRequest.updateStatus(id, {
      status: 'declined',
      admin_message: adminMessage,
    });
    return NextResponse.json({ success: true, request: updated });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}