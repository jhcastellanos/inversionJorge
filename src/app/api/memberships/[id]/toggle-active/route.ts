import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../../lib/models';
import { isAdminRequest } from '../../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const isActive = body.is_active === true;

    const membership = await Membership.setActive(id, isActive);

    return NextResponse.json({
      success: true,
      membership,
      message: isActive
        ? 'Membresía visible en el sitio'
        : 'Membresía oculta del sitio',
    });
  } catch (error) {
    console.error('Error toggling membership visibility:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    );
  }
}
