import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      let value = trimmed.slice('DATABASE_URL='.length).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return null;
}

async function main() {
  const connectionString = loadDatabaseUrl();
  if (!connectionString) {
    console.error('❌ Falta DATABASE_URL');
    process.exit(1);
  }

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin123*';
  const hash = bcrypt.hashSync(password, 10);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_user (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(
      `INSERT INTO admin_user (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [username, hash]
    );

    console.log(`✅ Usuario admin "${username}" listo (contraseña actualizada).`);
    console.log('   Login: /admin/login');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
