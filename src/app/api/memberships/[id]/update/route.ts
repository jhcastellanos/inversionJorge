import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const monthly_price = parseFloat(formData.get('monthly_price') as string);
    const benefits = formData.get('benefits') as string;
    const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';
    const image_url = formData.get('image_url') as string | null;
    const start_date_str = formData.get('start_date') as string;
    const start_date = start_date_str && start_date_str.trim() !== '' ? new Date(start_date_str) : null;

    console.log('Updating membership:', { 
      id, name, description, monthly_price, benefits, is_active, image_url, start_date
    });

    // Get current membership to keep existing image if no new URL provided
    const currentMembership = await Membership.findById(id);
    const finalImageUrl = image_url || currentMembership?.ImageUrl || null;

    const result = await Membership.update(id, {
      name,
      description,
      monthly_price,
      benefits,
      is_active,
      image_url: finalImageUrl,
      start_date,
    });

    console.log('Membership updated successfully:', result);

    return NextResponse.json({ success: true, membership: result }, { status: 200 });
  } catch (error) {
    console.error('Error updating membership:', error);
    return NextResponse.json({ 
      error: 'Failed to update membership', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
