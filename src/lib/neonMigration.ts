import { Pool, type PoolClient } from '@neondatabase/serverless';

/**
 * DDL (ALTER TABLE) en Neon debe usar conexión directa, no el pooler (-pooler en el host).
 */
export function getNeonMigrationConnectionString(): string {
  const raw =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DATABASE_URL no configurada');
  }
  return raw.replace('-pooler.', '.');
}

export async function withMigrationClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: getNeonMigrationConnectionString() });
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
    await pool.end();
  }
}
