import { pool } from './db';

let ready: Promise<void> | null = null;

export async function ensurePlatformUserAlumnoSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          ALTER TABLE platform_users
            ADD COLUMN IF NOT EXISTS alumno_access_until TIMESTAMPTZ
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_platform_users_alumno_until
            ON platform_users (alumno_access_until)
        `);
      } finally {
        client.release();
      }
    })();
  }
  await ready;
}