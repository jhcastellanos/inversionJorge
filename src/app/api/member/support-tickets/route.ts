import { NextRequest, NextResponse } from 'next/server';
import { getMemberFromRequest } from '../../../../lib/memberAuth';
import { PlatformUser } from '../../../../lib/platformUsers';
import { SupportTicket } from '../../../../lib/supportTickets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tickets = await SupportTicket.listByUserId(session.userId);
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await PlatformUser.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const body = await req.json();
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  const titleRaw = typeof body.title === 'string' ? body.title.trim() : '';
  const title = titleRaw.length > 0 ? titleRaw.slice(0, 200) : null;
  const isAnonymous = Boolean(body.is_anonymous);

  if (!text || text.length < 10) {
    return NextResponse.json({ error: 'Escribe al menos 10 caracteres en tu mensaje' }, { status: 400 });
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'El mensaje es demasiado largo' }, { status: 400 });
  }

  const ticket = await SupportTicket.create({
    userId: user.id,
    title,
    body: text,
    isAnonymous,
  });

  return NextResponse.json({ success: true, ticket });
}