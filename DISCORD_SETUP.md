# Discord Integration Setup

This guide explains how to set up Discord integration for automatic role assignment based on subscription status.

## Prerequisites

- An active Discord server
- Admin access to the Discord server
- A Discord application with a bot

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your application (e.g., "Your Course Platform Bot")
4. Click "Create"

## Step 2: Configure OAuth2

1. In your application, go to "OAuth2" → "General"
2. Add a redirect URL:
   ```
   http://localhost:3000/api/discord/callback
   ```
   (Update with your production URL when deploying)
3. Copy your **Client ID** and **Client Secret**

## Step 3: Create a Bot

1. Go to the "Bot" section in your application
2. Click "Add Bot"
3. Under "Privileged Gateway Intents", enable:
   - **Server Members Intent**
   - **Message Content Intent** (if you want the bot to send DMs)
4. Click "Reset Token" and copy your **Bot Token**
5. Under "Bot Permissions", enable:
   - **Manage Roles** (to assign/remove roles)
   - **Send Messages** (to send DMs)
   - **Read Messages/View Channels**

## Step 4: Invite Bot to Your Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - `bot`
   - `applications.commands` (optional)
3. Select bot permissions:
   - Manage Roles
   - Send Messages
   - Read Messages/View Channels
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Step 5: Get Server and Role IDs

### Get Guild ID (Server ID):
1. Enable Developer Mode in Discord:
   - **Opción 1 (Desktop):** User Settings (⚙️) → App Settings → Advanced → Enable "Developer Mode"
   - **Opción 2 (Si no ves Advanced):** User Settings (⚙️) → Appearance → scroll down → Enable "Developer Mode"
   - **Nota:** En algunas versiones, está en User Settings → Advanced directamente
2. Right-click your server icon → "Copy Server ID" (o "Copiar ID del servidor")

### Create and Get Role ID:
1. Go to Server Settings → Roles
2. Create a new role (e.g., "Premium Member")
3. Configure role permissions and appearance
4. Right-click the role → "Copy Role ID"

**Important:** Make sure the bot's role is positioned **higher** than the member role in the role hierarchy, otherwise the bot won't be able to assign the role.

## Step 6: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Discord OAuth2
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token_here

# Discord Server
DISCORD_GUILD_ID=your_server_id_here
DISCORD_MEMBER_ROLE_ID=your_role_id_here
```

## Step 7: Configure Stripe Webhook

For automatic role removal on subscription cancellation, make sure your Stripe webhook is configured to send these events:

- `customer.subscription.updated`
- `customer.subscription.deleted`

You can configure this in your [Stripe Dashboard](https://dashboard.stripe.com/webhooks).

## How It Works

### User Flow:
1. User subscribes to a membership
2. On subscription success page, user sees "Connect Discord" button
3. User clicks and authorizes with Discord OAuth2
4. Discord account is linked to subscription
5. Bot automatically assigns the member role
6. User receives a welcome DM

### Automatic Role Management:
- **When subscription becomes active:** Bot assigns member role
- **When subscription is cancelled:** Bot removes member role
- **When subscription expires:** Bot removes member role
- User receives DM notifications for status changes

## Testing the Integration

### Test OAuth Flow:
1. Subscribe to a membership
2. Click "Connect Discord" on success page
3. Authorize with Discord
4. Check that:
   - You're redirected back to the manage page
   - You see "Discord Connected" status
   - You have the member role in Discord

### Test Role Assignment:
1. Make a test subscription through Stripe
2. Connect Discord account
3. Verify role is assigned in Discord server
4. Check you received a welcome DM

### Test Role Removal:
1. Cancel subscription through Stripe Customer Portal
2. Wait for webhook to process (usually instant)
3. Verify role is removed from Discord
4. Check you received a cancellation DM

## Troubleshooting

### Role not assigned/removed:
- Check bot has "Manage Roles" permission
- Verify bot role is higher than member role in hierarchy
- Check bot token is correct in `.env`
- Check `DISCORD_GUILD_ID` and `DISCORD_MEMBER_ROLE_ID` are correct

### OAuth redirect fails:
- Verify redirect URL in Discord Developer Portal matches exactly
- Check `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Make sure URL includes protocol (http:// or https://)

### User not receiving DMs:
- Check bot has "Send Messages" permission
- Verify user has DMs enabled for server members
- Some users disable DMs from bots - this is expected behavior

### Webhook not triggering:
- Check Stripe webhook is configured for subscription events
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook endpoint is accessible (use ngrok for local testing)

## Production Deployment

When deploying to production:

1. Update Discord OAuth2 redirect URL:
   ```
   https://yourdomain.com/api/discord/callback
   ```

2. Add the new redirect URL in Discord Developer Portal (keep localhost for development)

3. Update `.env` with production values

4. Test the flow in production environment

## Security Notes

- Never commit `.env` file to version control
- Keep bot token secret - it has full access to your server
- Use environment-specific OAuth redirect URLs
- Regularly rotate bot token if compromised
- Review bot permissions regularly - only grant what's needed

## Additional Resources

- [Discord Developer Documentation](https://discord.com/developers/docs)
- [Discord OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Discord Bot Guide](https://discord.com/developers/docs/topics/gateway)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
