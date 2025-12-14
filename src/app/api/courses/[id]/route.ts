import { NextRequest, NextResponse } from 'next/server';
import { Course } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const course = await Course.findById(parseInt(params.id));
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { title, description, imageUrl, finalPrice, isActive } = await req.json();
  const course = await Course.update(parseInt(params.id), {
    title,
    description,
    image_url: imageUrl,
    final_price: finalPrice,
    is_active: isActive
  });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await Course.delete(parseInt(params.id));
  return NextResponse.json({ success: true });
}
