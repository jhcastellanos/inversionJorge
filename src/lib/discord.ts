// Discord API utilities

const DISCORD_API_URL = 'https://discord.com/api/v10';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Exchange OAuth2 code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/discord/callback`,
  });

  const response = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Get Discord user information
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user');
  }

  return response.json();
}

/**
 * Add role to a Discord server member using Bot Token
 */
export async function addRoleToMember(
  guildId: string,
  userId: string,
  roleId: string
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.error('DISCORD_BOT_TOKEN not configured');
    return false;
  }

  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.ok;
}

/**
 * Remove role from a Discord server member using Bot Token
 */
export async function removeRoleFromMember(
  guildId: string,
  userId: string,
  roleId: string
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.error('DISCORD_BOT_TOKEN not configured');
    return false;
  }

  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  return response.ok;
}

/**
 * Check if user is a member of the guild
 */
export async function isGuildMember(
  guildId: string,
  userId: string
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.error('DISCORD_BOT_TOKEN not configured');
    return false;
  }

  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  );

  return response.ok;
}

/**
 * Send a DM to a Discord user
 */
export async function sendDirectMessage(
  userId: string,
  content: string
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.error('DISCORD_BOT_TOKEN not configured');
    return false;
  }

  try {
    // Create DM channel
    const channelResponse = await fetch(`${DISCORD_API_URL}/users/@me/channels`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: userId }),
    });

    if (!channelResponse.ok) {
      return false;
    }

    const channel = await channelResponse.json();

    // Send message
    const messageResponse = await fetch(
      `${DISCORD_API_URL}/channels/${channel.id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    return messageResponse.ok;
  } catch (error) {
    console.error('Error sending DM:', error);
    return false;
  }
}
