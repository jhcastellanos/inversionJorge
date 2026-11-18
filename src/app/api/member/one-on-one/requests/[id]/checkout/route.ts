import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../../../../lib/memberAuth';
import { createOneOnOneCheckoutSession } from '../../../../../../../lib/oneOnOneStripe';
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

  try {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto');
    const { url } = await createOneOnOneCheckoutSession(id, session.userId, host, protocol);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al iniciar pago';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}