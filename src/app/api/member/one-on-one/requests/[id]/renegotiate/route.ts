import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../../../lib/memberAuth';
import { OneOnOneRequest } from '../../../../../../../lib/oneOnOneMeetings';
import { isAllowedBookableSlot, parseSlotIso } from '../../../../../../../lib/oneOnOneSlots';
import { sendOneOnOneCounterToOwner } from '../../../../../../../lib/oneOnOneMeetingEmails';
import { PlatformUser } from '../../../../../../../lib/platformUsers';
import { assertMemberCanRequestOneOnOne } from '../../../../../../../lib/oneOnOneAccess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/** Antes de pagar: el miembro pide otro horario sin cancelar la solicitud. */
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
  if (request.status !== 'awaiting_payment') {
    return NextResponse.json(
      { error: 'Solo puedes cambiar el horario antes de pagar, desde el estado «completa el pago».' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const startRaw = typeof body.meeting_start_at === 'string' ? body.meeting_start_at : '';
  const clientMessage =
    typeof body.client_message === 'string' ? body.client_message.trim().slice(0, 2000) : null;

  const start = parseSlotIso(startRaw);
  if (!start || !isAllowedBookableSlot(start)) {
    return NextResponse.json({ error: 'Horario no válido' }, { status: 400 });
  }

  if (new Date(request.meeting_start_at).getTime() === start.getTime()) {
    return NextResponse.json({ error: 'Elige un horario distinto al acordado actual' }, { status: 400 });
  }

  if (await OneOnOneRequest.isSlotTaken(start, id)) {
    return NextResponse.json({ error: 'Ese horario ya no está disponible' }, { status: 409 });
  }

  const updated = await OneOnOneRequest.updateStatus(id, {
    status: 'pending_admin',
    meeting_start_at: start,
    alternative_slots: null,
    admin_message: null,
    client_message: clientMessage,
    payment_deadline_at: null,
    stripe_checkout_session_id: null,
  });

  const user = await PlatformUser.findById(session.userId);
  if (user && updated) {
    try {
      await sendOneOnOneCounterToOwner(
        user.full_name,
        user.email,
        start.toISOString(),
        clientMessage,
        id,
        request.note
      );
    } catch (e) {
      console.error('[one-on-one] renegotiate aviso admin:', e);
    }
  }

  return NextResponse.json({ success: true, request: updated });
}