import { NextRequest, NextResponse } from 'next/server';
import { getSiteBaseUrl } from '../../../../../../lib/siteUrl';
import { getMemberFromRequest } from '../../../../../../lib/memberAuth';
import {
  addDiscordUserToGuild,
  discordRedirectUri,
  exchangeDiscordCode,
  fetchDiscordUser,
} from '../../../../../../lib/discordOAuth';
import { PlatformUser } from '../../../../../../lib/platformUsers';
import { ensurePlatformUserDiscordSchema } from '../../../../../../lib/platformUserDiscordSchema';
import { postDiscordLinkDestination } from '../../../../../../lib/memberDiscordGate';
import { syncMemberEntitlementsByEmail } from '../../../../../../lib/membershipEntitlementSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'discord_oauth_state';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');
  const baseUrl = getSiteBaseUrl(host, protocol);

  const error = req.nextUrl.searchParams.get('error');
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/conectar-discord?error=discord_denied', baseUrl));
  }

  const session = getMemberFromRequest(req);
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  const [cookieState, cookieUserId] = stateCookie?.split(':') ?? [];
  if (!session || !cookieState || cookieState !== state || String(session.userId) !== cookieUserId) {
    return NextResponse.redirect(new URL('/conectar-discord?error=discord_state', baseUrl));
  }

  try {
    const redirectUri = discordRedirectUri(host, protocol);
    const accessToken = await exchangeDiscordCode(code, redirectUri);
    const discordUser = await fetchDiscordUser(accessToken);

    await ensurePlatformUserDiscordSchema();
    await addDiscordUserToGuild(discordUser.id, accessToken);

    const updated = await PlatformUser.setDiscordUserId(session.userId, discordUser.id);
    if (!updated) {
      return NextResponse.redirect(new URL('/conectar-discord?error=discord_save', baseUrl));
    }

    await syncMemberEntitlementsByEmail(session.email).catch(() => null);

    const next = await postDiscordLinkDestination(session.userId);
    const res = NextResponse.redirect(new URL(next, baseUrl));
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    console.error('Discord OAuth callback:', e);
    return NextResponse.redirect(new URL('/conectar-discord?error=discord_callback', baseUrl));
  }
}