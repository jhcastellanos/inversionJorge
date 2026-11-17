import { getSiteBaseUrl } from './siteUrl';

const DISCORD_API = 'https://discord.com/api';

export function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID ?? process.env.DISCORD_APPLICATION_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  return { clientId, clientSecret, guildId, botToken };
}

export function discordRedirectUri(host: string | null, protocol: string | null) {
  const base = getSiteBaseUrl(host, protocol);
  return `${base}/api/member/auth/discord/callback`;
}

export function buildDiscordAuthorizeUrl(
  redirectUri: string,
  state: string
): string | null {
  const { clientId } = getDiscordOAuthConfig();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds.join',
    state,
    prompt: 'consent',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getDiscordOAuthConfig();
  if (!clientId || !clientSecret) {
    throw new Error('Discord OAuth no configurado');
  }

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    token_type?: string;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? 'No se pudo obtener token de Discord');
  }
  return data.access_token;
}

export async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as { id?: string; username?: string };
  if (!res.ok || !data.id) {
    throw new Error('No se pudo leer el perfil de Discord');
  }
  return { id: data.id, username: data.username ?? data.id };
}

/** Añade al usuario al servidor de la academia con el token OAuth (scope guilds.join). */
export async function addDiscordUserToGuild(discordUserId: string, userAccessToken: string) {
  const { guildId, botToken } = getDiscordOAuthConfig();
  if (!guildId || !botToken) return { ok: false, skipped: true as const };

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_token: userAccessToken }),
  });

  if (res.status === 201 || res.status === 204) return { ok: true as const };
  if (res.status === 409) return { ok: true as const, alreadyMember: true as const };
  const text = await res.text().catch(() => '');
  return { ok: false as const, status: res.status, reason: text || res.statusText };
}