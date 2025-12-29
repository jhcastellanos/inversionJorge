import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Initiate Discord OAuth2 flow
 * User clicks "Connect Discord" button and is redirected here
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/discord/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Discord not configured' }, { status: 500 });
  }

  // Store email in state parameter to retrieve after OAuth
  const state = Buffer.from(JSON.stringify({ email })).toString('base64');

  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
  discordAuthUrl.searchParams.set('client_id', clientId);
  discordAuthUrl.searchParams.set('redirect_uri', redirectUri);
  discordAuthUrl.searchParams.set('response_type', 'code');
  discordAuthUrl.searchParams.set('scope', 'identify guilds.join');
  discordAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(discordAuthUrl.toString());
}
