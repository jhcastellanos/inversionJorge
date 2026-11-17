/**
 * Bot de Discord: vincular cuenta + sincronizar rol Trader con membresía Stripe.
 *
 * Requiere .env en la raíz del repo (o bots/discord-membership-bot/.env):
 * DATABASE_URL, STRIPE_SECRET_KEY, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID,
 * DISCORD_TRADER_ROLE_ID, DISCORD_APPLICATION_ID (para registrar comandos)
 *
 * Ejecutar desde raíz del monorepo:
 *   npm run discord-bot
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../.env') });

const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const APP_ID = process.env.DISCORD_APPLICATION_ID!;
const SYNC_INTERVAL_MS = Number(process.env.MEMBERSHIP_SYNC_INTERVAL_MS ?? 15 * 60 * 1000);

async function loadSyncLib() {
  const { syncMemberEntitlementsByEmail, syncAllStripeLinkedMembers } = await import(
    '../../src/lib/membershipEntitlementSync.ts'
  );
  const { PlatformUser } = await import('../../src/lib/platformUsers.ts');
  const { ensurePlatformUserDiscordSchema } = await import('../../src/lib/platformUserDiscordSchema.ts');
  return { syncMemberEntitlementsByEmail, syncAllStripeLinkedMembers, PlatformUser, ensurePlatformUserDiscordSchema };
}

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('vincular')
      .setDescription('Vincula tu cuenta de la plataforma con este Discord')
      .addStringOption((o) =>
        o.setName('email').setDescription('Email con el que te registraste en la plataforma').setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName('mi-acceso')
      .setDescription('Revisa tu membresía y sincroniza roles de plataforma y Discord'),
  ].map((c) => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body: commands });
  console.log('Comandos slash registrados');
}

async function handleVincular(interaction: ChatInputCommandInteraction) {
  const email = interaction.options.getString('email', true).trim();
  const discordId = interaction.user.id;
  const lib = await loadSyncLib();
  await lib.ensurePlatformUserDiscordSchema();

  const user = await lib.PlatformUser.findByEmail(email);
  if (!user) {
    await interaction.reply({
      content: 'No encontramos ese email en la plataforma. Regístrate primero o revisa el correo.',
      ephemeral: true,
    });
    return;
  }

  await lib.PlatformUser.setDiscordUserId(user.id, discordId);
  const result = await lib.syncMemberEntitlementsByEmail(email);

  if (!result) {
    await interaction.reply({ content: 'No se pudo sincronizar.', ephemeral: true });
    return;
  }

  const discordNote = result.discord?.ok
    ? result.subscriptionActive
      ? 'Rol **Trader** asignado en Discord.'
      : 'Membresía inactiva: rol Trader retirado (solo @everyone).'
    : `Discord: ${result.discord?.reason ?? 'no configurado'}`;

  await interaction.reply({
    content: `Cuenta vinculada a **${email}**. Rol en plataforma: **${result.newRole}**. ${discordNote}`,
    ephemeral: true,
  });
}

async function handleMiAcceso(interaction: ChatInputCommandInteraction) {
  const lib = await loadSyncLib();
  await lib.ensurePlatformUserDiscordSchema();
  const target = await findByDiscordId(interaction.user.id);
  if (!target) {
    await interaction.reply({
      content: 'Primero usa `/vincular` con el email de tu cuenta en la plataforma.',
      ephemeral: true,
    });
    return;
  }

  const result = await lib.syncMemberEntitlementsByEmail(target.email);
  if (!result) {
    await interaction.reply({ content: 'Error al sincronizar.', ephemeral: true });
    return;
  }

  await interaction.reply({
    content: `Membresía Stripe: **${result.subscriptionActive ? 'activa' : 'inactiva'}**. Rol plataforma: **${result.newRole}**.`,
    ephemeral: true,
  });
}

async function findByDiscordId(discordId: string) {
  const { pool } = await import('../../src/lib/db');
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT * FROM platform_users WHERE discord_user_id = $1 LIMIT 1', [discordId]);
    return r.rows[0] ?? null;
  } finally {
    client.release();
  }
}

async function runPeriodicSync() {
  const lib = await loadSyncLib();
  const results = await lib.syncAllStripeLinkedMembers();
  const changed = results.filter((r) => r.changed);
  console.log(`[sync] ${results.length} usuarios, ${changed.length} cambios`);
}

async function main() {
  if (!TOKEN || !GUILD_ID || !APP_ID) {
    console.error('Faltan DISCORD_BOT_TOKEN, DISCORD_GUILD_ID o DISCORD_APPLICATION_ID');
    process.exit(1);
  }

  if (process.argv.includes('--sync-once')) {
    await runPeriodicSync();
    process.exit(0);
  }

  await registerCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on('ready', () => {
    console.log(`Bot listo como ${client.user?.tag}`);
    void runPeriodicSync();
    setInterval(() => void runPeriodicSync(), SYNC_INTERVAL_MS);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === 'vincular') {
        await handleVincular(interaction);
      } else if (interaction.commandName === 'mi-acceso') {
        await handleMiAcceso(interaction);
      }
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Error interno.', ephemeral: true });
      }
    }
  });

  await client.login(TOKEN);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});