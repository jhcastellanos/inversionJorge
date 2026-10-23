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

const SQL = `
CREATE TABLE IF NOT EXISTS platform_calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  zoom_url TEXT,
  event_kind VARCHAR(32) NOT NULL DEFAULT 'clase_en_vivo',
  event_level VARCHAR(16) NOT NULL DEFAULT 'basico',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS zoom_url TEXT;
ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva';
ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS force_live BOOLEAN DEFAULT false;
ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS suppress_live BOOLEAN DEFAULT false;
`;

function directNeonUrl(url) {
  return url.replace('-pooler.', '.');
}

async function main() {
  const connectionString = directNeonUrl(
    process.env.DATABASE_URL_UNPOOLED || loadDatabaseUrl()
  );
  if (!connectionString) {
    console.error('❌ Falta DATABASE_URL');
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅ Esquema platform_calendar_events (zoom_url, event_tier) listo');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
