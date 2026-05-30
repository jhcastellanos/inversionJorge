import { NextRequest, NextResponse } from 'next/server';
import { Course } from '../../../lib/models';
import { isAdminRequest } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Crear un curso (POST)
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, imageUrl, finalPrice, isActive, startDate, endDate } = await req.json();
  if (!title || !description || !imageUrl || !finalPrice) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const course = await Course.create({
      title,
      description,
      image_url: imageUrl,
      final_price: finalPrice,
      is_active: isActive ?? true,
      start_date: startDate,
      end_date: endDate
    });
    return NextResponse.json(course);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 });
  }
}

// Listar cursos (GET) - solo admin, devuelve también cursos inactivos
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const courses = await Course.findAll();
    return NextResponse.json(courses);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 });
  }
}
