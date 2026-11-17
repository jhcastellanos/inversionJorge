import { pool } from './db';

let ready: Promise<void> | null = null;

export async function ensurePlatformUserDiscordSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE platform_users
          ADD COLUMN IF NOT EXISTS discord_user_id VARCHAR(32)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_platform_users_discord
          ON platform_users (discord_user_id)
          WHERE discord_user_id IS NOT NULL
        `);
      } finally {
        client.release();
      }
    })();
  }
  await ready;
}