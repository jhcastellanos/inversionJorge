import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../../lib/models';
import { isAdminRequest } from '../../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await Membership.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete membership' }, 
      { status: 500 }
    );
  }
}
