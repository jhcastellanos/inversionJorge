import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const subscriptions = await Subscription.findByEmail(email);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Error fetching subscriptions' }, { status: 500 });
  }
}
