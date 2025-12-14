import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Course } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });

  console.log('🛒 Checkout for courseId:', courseId);
  const course = await Course.findById(parseInt(courseId));
  console.log('📦 Found course:', course);
  
  if (!course || !course.IsActive) {
    return NextResponse.json({ error: 'Course not found or inactive' }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.Title,
            description: course.Description,
            images: course.ImageUrl ? [course.ImageUrl] : [],
          },
          unit_amount: Math.round(course.Price * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: { courseId: course.Id.toString() },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`,
  });

  return NextResponse.json({ url: session.url });
}
