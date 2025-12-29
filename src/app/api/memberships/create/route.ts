import { NextRequest, NextResponse } from 'next/server';
import { Membership } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const monthly_price = parseFloat(formData.get('monthly_price') as string);
    const benefits = formData.get('benefits') as string;
    const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';
    const image_url = formData.get('image_url') as string | null;
    const start_date_str = formData.get('start_date') as string;
    const start_date = start_date_str && start_date_str.trim() !== '' ? new Date(start_date_str) : null;

    console.log('Creating membership:', { 
      name, description, monthly_price, benefits, is_active, image_url, start_date
    });

    const result = await Membership.create({
      name,
      description,
      monthly_price,
      benefits,
      is_active,
      image_url: image_url || null,
      start_date,
    });

    console.log('Membership created successfully:', result);

    return NextResponse.json({ success: true, membership: result }, { status: 200 });
  } catch (error) {
    console.error('Error creating membership:', error);
    return NextResponse.json({ 
      error: 'Failed to create membership', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
