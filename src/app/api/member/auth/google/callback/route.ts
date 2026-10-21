import { NextRequest, NextResponse } from 'next/server';
import { getSiteBaseUrl } from '../../../../../../lib/siteUrl';
import { PlatformUser } from '../../../../../../lib/platformUsers';
import { getMemberAccess } from '../../../../../../lib/memberAccess';
import { signMemberJwt, MEMBER_COOKIE, memberCookieOptions } from '../../../../../../lib/memberAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  name?: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');
  const baseUrl = getSiteBaseUrl(host, protocol);

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', baseUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', baseUrl));
  }

  const redirectUri = `${baseUrl}/api/member/auth/google/callback`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(new URL('/login?error=google_token_failed', baseUrl));
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileRes.json()) as GoogleUserInfo;
  if (!profileRes.ok || !profile.sub || !profile.email) {
    return NextResponse.redirect(new URL('/login?error=google_profile_failed', baseUrl));
  }

  let user =
    (await PlatformUser.findByGoogleId(profile.sub)) ??
    (await PlatformUser.findByEmail(profile.email));

  if (!user) {
    user = await PlatformUser.create({
      email: profile.email,
      full_name: profile.name || profile.email.split('@')[0],
      google_id: profile.sub,
    });
  } else if (!user.google_id) {
    const linked = await PlatformUser.linkGoogleId(user.id, profile.sub);
    user = linked ?? (await PlatformUser.findById(user.id));
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=google_user_failed', baseUrl));
  }

  const access = await getMemberAccess(user);
  const token = signMemberJwt({ userId: user.id, email: user.email });

  const destination =
    access.hasAccess && user.onboarding_completed ? `${baseUrl}/app` : `${baseUrl}/onboarding`;

  const res = NextResponse.redirect(destination);
  res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions());
  return res;
}
