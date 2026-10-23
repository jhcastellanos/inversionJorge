import { pool } from './db';

let schemaReady: Promise<void> | null = null;

/**
 * Asegura columnas zoom_url y event_tier en Neon/producción (idempotente).
 * Se ejecuta una vez por instancia del servidor.
 */
export function ensurePlatformCalendarEventSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS platform_calendar_events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            zoom_url TEXT,
            event_kind VARCHAR(32) NOT NULL DEFAULT 'clase_en_vivo'
              CHECK (event_kind IN ('clase_en_vivo', 'operativa_en_vivo')),
            event_level VARCHAR(16) NOT NULL CHECK (event_level IN ('basico', 'medio', 'avanzado')),
            starts_at TIMESTAMPTZ NOT NULL,
            ends_at TIMESTAMPTZ,
            is_published BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(
          `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS zoom_url TEXT`
        );
        await client.query(
          `ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva'`
        );
        await client.query(`
          UPDATE platform_calendar_events SET event_tier = 'clase_retrospectiva'
          WHERE event_tier IS NULL OR event_tier = ''
        `);
      } finally {
        client.release();
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
