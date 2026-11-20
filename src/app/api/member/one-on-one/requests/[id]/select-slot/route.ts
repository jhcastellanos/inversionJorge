import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../../../lib/memberAuth';
import {
  OneOnOneRequest,
  paymentDeadlineForMeetingStart,
} from '../../../../../../../lib/oneOnOneMeetings';
import { parseSlotIso } from '../../../../../../../lib/oneOnOneSlots';
import { sendOneOnOneApprovedToMember } from '../../../../../../../lib/oneOnOneMeetingEmails';
import { PlatformUser } from '../../../../../../../lib/platformUsers';
import { assertMemberCanRequestOneOnOne } from '../../../../../../../lib/oneOnOneAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, context: Ctx) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await assertMemberCanRequestOneOnOne(session.userId);
  if (blocked) return blocked;

  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const request = await OneOnOneRequest.findById(id);
  if (!request || request.user_id !== session.userId) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (request.status !== 'awaiting_client_slot') {
    return NextResponse.json({ error: 'Esta solicitud no espera elegir horario' }, { status: 400 });
  }

  const body = await req.json();
  const startRaw = typeof body.meeting_start_at === 'string' ? body.meeting_start_at : '';
  const start = parseSlotIso(startRaw);
  if (!start) return NextResponse.json({ error: 'Horario inválido' }, { status: 400 });

  const alts = (request.alternative_slots ?? []) as string[];
  if (!alts.includes(start.toISOString()) && !alts.some((a) => new Date(a).getTime() === start.getTime())) {
    return NextResponse.json({ error: 'Debes elegir uno de los horarios propuestos' }, { status: 400 });
  }

  if (await OneOnOneRequest.isSlotTaken(start, id)) {
    return NextResponse.json({ error: 'Ese horario ya está reservado' }, { status: 409 });
  }

  const deadline = paymentDeadlineForMeetingStart(start);
  if (deadline.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: 'Ese horario ya no permite completar el pago a tiempo (menos de 3 h antes del inicio)' },
      { status: 400 }
    );
  }

  const updated = await OneOnOneRequest.updateStatus(id, {
    status: 'awaiting_payment',
    meeting_start_at: start,
    alternative_slots: null,
    payment_deadline_at: deadline,
  });

  const user = await PlatformUser.findById(session.userId);
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
      console.error('[one-on-one] email pago tras alternativa no enviado:', emailErr);
    }
  }

  return NextResponse.json({ success: true, request: updated });
}