import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getDiscordUser, addRoleToMember, isGuildMember } from '../../../../lib/discord';
import { DiscordConnection, Subscription } from '../../../../lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Discord OAuth2 callback
 * After user authorizes, Discord redirects here with code
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/manage?error=discord_auth_failed`
    );
  }

  try {
    // Decode state to get email
    const { email } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Save or update Discord connection
    const existing = await DiscordConnection.findByEmail(email);
    
    if (existing) {
      await DiscordConnection.update(email, {
        discord_user_id: discordUser.id,
        discord_username: `${discordUser.username}#${discordUser.discriminator}`,
        discord_access_token: tokenData.access_token,
        discord_refresh_token: tokenData.refresh_token,
      });
    } else {
      await DiscordConnection.create({
        customer_email: email,
        discord_user_id: discordUser.id,
        discord_username: `${discordUser.username}#${discordUser.discriminator}`,
        discord_access_token: tokenData.access_token,
        discord_refresh_token: tokenData.refresh_token,
      });
    }

    // Update all active subscriptions with Discord user ID
    const activeSubscriptions = await Subscription.findByEmail(email);
    for (const subscription of activeSubscriptions) {
      await Subscription.updateDiscordUserId(subscription.StripeSubscriptionId, discordUser.id);
    }

    // Add role to Discord server if configured
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_MEMBER_ROLE_ID;

    if (guildId && roleId && activeSubscriptions.length > 0) {
      // Check if user is in the server
      const isMember = await isGuildMember(guildId, discordUser.id);
      
      if (isMember) {
        // Add role to user
        const roleAdded = await addRoleToMember(guildId, discordUser.id, roleId);
        
        if (roleAdded) {
          console.log(`✅ Role added to Discord user ${discordUser.id}`);
        } else {
          console.error(`❌ Failed to add role to Discord user ${discordUser.id}`);
        }
      } else {
        console.log(`⚠️ User ${discordUser.id} is not a member of the guild`);
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/manage?discord_connected=true`
    );
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/manage?error=discord_auth_failed`
    );
  }
}
