import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../lib/models';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const membership = await Membership.findById(id);
    
    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}
