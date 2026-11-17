import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getMemberFromRequest } from '../../../../../lib/memberAuth';
import {
  buildDiscordAuthorizeUrl,
  discordRedirectUri,
  getDiscordOAuthConfig,
} from '../../../../../lib/discordOAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'discord_oauth_state';

export async function GET(req: NextRequest) {
  const session = getMemberFromRequest(req);
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const { clientId, clientSecret } = getDiscordOAuthConfig();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/conectar-discord?error=discord_not_configured', req.url));
  }

  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');
  const redirectUri = discordRedirectUri(host, protocol);
  const state = randomBytes(24).toString('hex');

  const url = buildDiscordAuthorizeUrl(redirectUri, state);
  if (!url) {
    return NextResponse.redirect(new URL('/conectar-discord?error=discord_not_configured', req.url));
  }

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, `${state}:${session.userId}`, {
    httpOnly: true,
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}