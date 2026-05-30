import { NextRequest, NextResponse } from 'next/server';
import { Course } from '../../../../lib/models';
import { isAdminRequest } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const course = await Course.findById(parseInt(params.id));
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, imageUrl, finalPrice, isActive, startDate, endDate } = await req.json();
  const course = await Course.update(parseInt(params.id), {
    title,
    description,
    image_url: imageUrl,
    final_price: finalPrice,
    is_active: isActive,
    start_date: startDate,
    end_date: endDate
  });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await Course.delete(parseInt(params.id));
  return NextResponse.json({ success: true });
}
