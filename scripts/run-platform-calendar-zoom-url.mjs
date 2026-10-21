import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Pool } from '@neondatabase/serverless';

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
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
  const sql = readFileSync(join(process.cwd(), 'scripts/platform-calendar-zoom-url.sql'), 'utf8');
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Columna zoom_url en platform_calendar_events');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
