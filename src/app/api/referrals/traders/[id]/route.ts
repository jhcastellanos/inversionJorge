import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../../lib/auth';
import { ReferralTrader } from '../../../../../lib/referrals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const traderId = parseInt(id, 10);
  if (!Number.isFinite(traderId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    await ReferralTrader.delete(traderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting referral trader:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar' },
      { status: 400 }
    );
  }
}
