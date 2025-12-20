import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Course } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });

    console.log('🛒 Checkout for courseId:', courseId);
    const course = await Course.findById(parseInt(courseId));
    console.log('📦 Found course:', course);
    
    if (!course || !course.IsActive) {
      return NextResponse.json({ error: 'Course not found or inactive' }, { status: 404 });
    }

    // Get the base URL from the request headers
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Validate and sanitize image URL
    let imageUrls: string[] = [];
    if (course.ImageUrl) {
      try {
        const url = course.ImageUrl.trim();
        // Only include valid HTTP/HTTPS URLs
        if (url.startsWith('http://') || url.startsWith('https://')) {
          imageUrls = [url];
        }
      } catch (e) {
        console.warn('Invalid image URL for course:', courseId);
      }
    }

    // Sanitize description (remove any potential JSON-breaking characters)
    const description = course.Description 
      ? course.Description.substring(0, 500).replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      : '';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.Title || 'Curso',
              description: description,
              images: imageUrls,
            },
            unit_amount: Math.round(parseFloat(course.Price.toString()) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { courseId: course.Id.toString() },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
