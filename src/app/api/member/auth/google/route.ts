import { NextRequest, NextResponse } from 'next/server';
import { getSiteBaseUrl } from '../../../../../lib/siteUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url));
  }

  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');
  const baseUrl = getSiteBaseUrl(host, protocol);
  const redirectUri = `${baseUrl}/api/member/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
