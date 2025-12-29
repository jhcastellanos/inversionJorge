import { NextRequest, NextResponse } from 'next/server';
import { DiscordConnection } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Get Discord connection status for a user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  try {
    const connection = await DiscordConnection.findByEmail(email);

    if (!connection) {
      return NextResponse.json({
        connected: false
      });
    }

    return NextResponse.json({
      connected: true,
      discordUsername: connection.DiscordUsername,
      discordUserId: connection.DiscordUserId
    });
  } catch (error) {
    console.error('Error fetching Discord status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Discord status' },
      { status: 500 }
    );
  }
}
