import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
