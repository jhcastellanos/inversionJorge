import { pool } from './db';

let ready: Promise<void> | null = null;

export async function ensurePlatformUserRoleManualSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE platform_users
            ADD COLUMN IF NOT EXISTS platform_role_manual BOOLEAN NOT NULL DEFAULT false
        `);
      } finally {
        client.release();
      }
    })();
  }
  await ready;
}