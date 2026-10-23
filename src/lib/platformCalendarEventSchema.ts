import { withMigrationClient } from './neonMigration';

let schemaReady: Promise<void> | null = null;

export function resetPlatformCalendarEventSchemaCache() {
  schemaReady = null;
}

const DDL_STEPS = [
  `CREATE TABLE IF NOT EXISTS platform_calendar_events (
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
  )`,
  `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS zoom_url TEXT`,
  `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS event_kind VARCHAR(32) DEFAULT 'clase_en_vivo'`,
  `UPDATE platform_calendar_events SET event_kind = 'clase_en_vivo' WHERE event_kind IS NULL`,
  `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva'`,
  `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS force_live BOOLEAN DEFAULT false`,
  `UPDATE platform_calendar_events SET force_live = false WHERE force_live IS NULL`,
  `UPDATE platform_calendar_events SET event_tier = 'clase_retrospectiva' WHERE event_tier IS NULL OR event_tier = ''`,
];

async function runCalendarEventSchemaMigration() {
  await withMigrationClient(async (client) => {
    for (const sql of DDL_STEPS) {
      await client.query(sql);
    }
  });
}

/**
 * Asegura columnas zoom_url, event_tier, force_live en Neon (conexión directa para DDL).
 */
export function ensurePlatformCalendarEventSchema(options?: { force?: boolean }): Promise<void> {
  if (options?.force) {
    schemaReady = null;
  }
  if (!schemaReady) {
    schemaReady = runCalendarEventSchemaMigration().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
