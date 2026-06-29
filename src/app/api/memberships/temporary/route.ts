import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../lib/models';
import { isAdminRequest } from '../../../../lib/auth';
import {
  TEMPORARY_MEMBERSHIP_DEFAULTS,
  TEMPORARY_MEMBERSHIP_NAME,
} from '../../../../lib/temporaryMembership';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Ensures the $150 temporary membership row exists (inactive by default). */
async function ensureTemporaryMembership() {
  let membership = await Membership.findByName(TEMPORARY_MEMBERSHIP_NAME);
  if (membership) return membership;

  membership = await Membership.create({
    name: TEMPORARY_MEMBERSHIP_DEFAULTS.name,
    description: TEMPORARY_MEMBERSHIP_DEFAULTS.description,
    monthly_price: TEMPORARY_MEMBERSHIP_DEFAULTS.monthly_price,
    benefits: TEMPORARY_MEMBERSHIP_DEFAULTS.benefits,
    is_active: false,
  });
  return membership;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await ensureTemporaryMembership();
  return NextResponse.json({ membership });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const isActive = body.is_active === true;
    const membership = await ensureTemporaryMembership();
    const updated = await Membership.setActive(membership.Id, isActive);
    // Solo cambia visibilidad de la membresía temporal; las demás no se tocan.

    return NextResponse.json({
      success: true,
      membership: updated,
      message: isActive
        ? 'Oferta temporal $150/mes visible en el sitio'
        : 'Oferta temporal $150/mes oculta del sitio',
    });
  } catch (error) {
    console.error('Error toggling temporary membership:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    );
  }
}
