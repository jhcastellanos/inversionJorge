import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../../../lib/memberAuth';
import { OneOnOneRequest } from '../../../../../../../lib/oneOnOneMeetings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const CANCELLABLE = new Set(['pending_admin', 'awaiting_client_slot', 'awaiting_payment']);

export async function POST(req: NextRequest, context: Ctx) {
  const session = getMemberFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const request = await OneOnOneRequest.findById(id);
  if (!request || request.user_id !== session.userId) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!CANCELLABLE.has(request.status)) {
    return NextResponse.json({ error: 'Esta solicitud ya no se puede cancelar desde aquí' }, { status: 400 });
  }

  const updated = await OneOnOneRequest.updateStatus(id, {
    status: 'cancelled',
    alternative_slots: null,
    payment_deadline_at: null,
  });

  return NextResponse.json({ success: true, request: updated });
}