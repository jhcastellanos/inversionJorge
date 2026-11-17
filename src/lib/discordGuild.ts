const DISCORD_API = 'https://discord.com/api/v10';

function discordConfig() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const traderRoleId = process.env.DISCORD_TRADER_ROLE_ID;
  if (!token || !guildId || !traderRoleId) {
    return null;
  }
  return { token, guildId, traderRoleId };
}

async function discordRequest(method: string, path: string, body?: unknown) {
  const cfg = discordConfig();
  if (!cfg) {
    return { ok: false, skipped: true as const, reason: 'Discord no configurado' };
  }

  const res = await fetch(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return { ok: true as const };
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false as const, status: res.status, reason: text || res.statusText };
  }
  return { ok: true as const };
}

/** Asigna o quita el rol Trader en el servidor (sin tocar @everyone). */
export async function syncDiscordTraderRole(discordUserId: string, shouldHaveTraderRole: boolean) {
  const cfg = discordConfig();
  if (!cfg) {
    return { ok: true, skipped: true, reason: 'Discord env vars missing' };
  }

  const memberPath = `/guilds/${cfg.guildId}/members/${discordUserId}`;
  const rolePath = `${memberPath}/roles/${cfg.traderRoleId}`;

  if (shouldHaveTraderRole) {
    const put = await discordRequest('PUT', rolePath);
    if (put.ok) return { ok: true, action: 'grant_trader' as const };
    if (!put.ok && 'status' in put && put.status === 404) {
      return {
        ok: false,
        action: 'grant_trader' as const,
        reason: 'El usuario no está en el servidor de Discord',
      };
    }
    return { ok: false, action: 'grant_trader' as const, reason: put.reason };
  }

  const del = await discordRequest('DELETE', rolePath);
  if (del.ok || (!del.ok && 'status' in del && del.status === 404)) {
    return { ok: true, action: 'revoke_trader' as const };
  }
  return { ok: false, action: 'revoke_trader' as const, reason: del.reason };
}