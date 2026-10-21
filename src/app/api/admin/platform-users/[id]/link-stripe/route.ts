import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../../../lib/auth';
import { PlatformUser } from '../../../../../../lib/platformUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await req.json();
  const stripeCustomerId =
    typeof body.stripe_customer_id === 'string' ? body.stripe_customer_id.trim() : '';

  if (!stripeCustomerId.startsWith('cus_')) {
    return NextResponse.json(
      { error: 'stripe_customer_id debe empezar con cus_' },
      { status: 400 }
    );
  }

  const updated = await PlatformUser.updateStripeCustomerId(userId, stripeCustomerId);
  if (!updated) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: updated });
}
