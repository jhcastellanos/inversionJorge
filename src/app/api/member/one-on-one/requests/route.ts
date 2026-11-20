import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import { PlatformUser } from '../../../../../lib/platformUsers';
import {
  OneOnOneRequest,
  ensureOneOnOneSchema,
} from '../../../../../lib/oneOnOneMeetings';
import { isAllowedBookableSlot, parseSlotIso } from '../../../../../lib/oneOnOneSlots';
import { deliverOneOnOneNewRequestEmails } from '../../../../../lib/oneOnOneMeetingEmails';
import { assertMemberCanRequestOneOnOne } from '../../../../../lib/oneOnOneAccess';
import { oneOnOneRequestBlocksNewBooking } from '../../../../../lib/oneOnOneTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureOneOnOneSchema();
  await OneOnOneRequest.expireStalePayments();
  const requests = await OneOnOneRequest.listByUserId(session.userId);
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await assertMemberCanRequestOneOnOne(session.userId);
  if (blocked) return blocked;

  const user = await PlatformUser.findById(session.userId);
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const body = await req.json();
  const startRaw = typeof body.meeting_start_at === 'string' ? body.meeting_start_at : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';

  const start = parseSlotIso(startRaw);
  if (!start || !isAllowedBookableSlot(start)) {
    return NextResponse.json(
      { error: 'Horario no válido. Solo L–V 12:00–20:00 con al menos 24 h de anticipación.' },
      { status: 400 }
    );
  }

  if (!note || note.length < 10) {
    return NextResponse.json({ error: 'Describe tu consulta (mínimo 10 caracteres).' }, { status: 400 });
  }
  if (note.length > 4000) {
    return NextResponse.json({ error: 'Nota demasiado larga' }, { status: 400 });
  }

  await ensureOneOnOneSchema();
  const existing = await OneOnOneRequest.listByUserId(user.id);
  const open = existing.find((r) =>
    oneOnOneRequestBlocksNewBooking(r.status, r.meeting_start_at)
  );
  if (open) {
    return NextResponse.json(
      {
        error:
          'Ya tienes una solicitud en curso. Espera a que se revise, completes el pago o finalice la sesión antes de pedir otra.',
      },
      { status: 409 }
    );
  }

  if (await OneOnOneRequest.isSlotTaken(start)) {
    return NextResponse.json({ error: 'Ese horario ya no está disponible' }, { status: 409 });
  }

  const created = await OneOnOneRequest.create({
    userId: user.id,
    meetingStartAt: start,
    note,
  });

  const iso = start.toISOString();
  try {
    await deliverOneOnOneNewRequestEmails(user.email, user.full_name, iso, note, created.id);
  } catch (emailErr) {
    console.error('[one-on-one] emails no enviados tras crear solicitud:', emailErr);
  }

  return NextResponse.json({ success: true, request: created });
}