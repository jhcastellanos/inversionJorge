import { pool } from './db';
import {
  ensurePlatformCalendarEventSchema,
  resetPlatformCalendarEventSchemaCache,
} from './platformCalendarEventSchema';
import { DEFAULT_EVENT_DURATION_MS } from './platformEventDisplay';
import type { ClassLevel, EventKind, EventLevel, LiveEventTier } from './platformRoles';

export type PlatformClassRow = {
  id: number;
  title: string;
  description: string | null;
  section_name: string;
  class_level: ClassLevel;
  video_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PlatformCalendarEventRow = {
  id: number;
  title: string;
  description: string | null;
  zoom_url: string | null;
  event_kind: EventKind;
  event_level: EventLevel;
  event_tier: LiveEventTier | null;
  starts_at: Date;
  ends_at: Date | null;
  is_published: boolean;
  force_live: boolean;
  suppress_live: boolean;
  created_at: Date;
  updated_at: Date;
};

export const PlatformClass = {
  async findPublished(): Promise<PlatformClassRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_classes WHERE is_published = true
         ORDER BY section_name, sort_order, created_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findAllAdmin(): Promise<PlatformClassRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_classes ORDER BY section_name, sort_order, created_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async create(data: {
    title: string;
    description?: string;
    section_name?: string;
    class_level: ClassLevel;
    video_url?: string | null;
    sort_order?: number;
    is_published?: boolean;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO platform_classes
         (title, description, section_name, class_level, video_url, sort_order, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          data.title,
          data.description ?? null,
          data.section_name ?? 'General',
          data.class_level,
          data.video_url ?? null,
          data.sort_order ?? 0,
          data.is_published ?? true,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      section_name: string;
      class_level: ClassLevel;
      video_url: string | null;
      sort_order: number;
      is_published: boolean;
    }>
  ) {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          fields.push(`${key} = $${i++}`);
          values.push(val);
        }
      }
      if (fields.length === 0) return null;
      fields.push('updated_at = NOW()');
      values.push(id);
      const result = await client.query(
        `UPDATE platform_classes SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async delete(id: number) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM platform_classes WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },
};

export const PlatformCalendarEvent = {
  async findPublishedFromNow(): Promise<PlatformCalendarEventRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_calendar_events
         WHERE is_published = true AND starts_at >= NOW() - INTERVAL '30 days'
         ORDER BY starts_at ASC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  /** Ventana para inicio: eventos en vivo recientes + próximos */
  async findPublishedForHome(): Promise<PlatformCalendarEventRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_calendar_events
         WHERE is_published = true
           AND starts_at >= NOW() - INTERVAL '2 days'
           AND starts_at <= NOW() + INTERVAL '120 days'
         ORDER BY starts_at ASC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findAllAdmin(): Promise<PlatformCalendarEventRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_calendar_events ORDER BY starts_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async create(data: {
    title: string;
    description?: string;
    zoom_url?: string | null;
    event_kind?: EventKind;
    event_level: EventLevel;
    event_tier?: LiveEventTier;
    starts_at: Date;
    ends_at?: Date | null;
    is_published?: boolean;
    force_live?: boolean;
    suppress_live?: boolean;
  }) {
    const insert = async () => {
      await ensurePlatformCalendarEventSchema();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO platform_calendar_events
           (title, description, zoom_url, event_kind, event_level, event_tier, starts_at, ends_at, is_published, force_live, suppress_live, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           RETURNING *`,
          [
            data.title,
            data.description ?? null,
            data.zoom_url ?? null,
            data.event_kind ?? 'clase_en_vivo',
            data.event_level,
            data.event_tier ?? 'clase_retrospectiva',
            data.starts_at,
            data.ends_at ??
              new Date(data.starts_at.getTime() + DEFAULT_EVENT_DURATION_MS),
            data.is_published ?? true,
            data.force_live ?? false,
            data.suppress_live ?? false,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    };

    try {
      return await insert();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (/column|relation|does not exist/i.test(msg)) {
        resetPlatformCalendarEventSchemaCache();
        await ensurePlatformCalendarEventSchema({ force: true });
        return await insert();
      }
      throw err;
    }
  },

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      zoom_url: string | null;
      event_kind: EventKind;
      event_level: EventLevel;
      event_tier: LiveEventTier;
      starts_at: Date;
      ends_at: Date | null;
      is_published: boolean;
      force_live: boolean;
      suppress_live: boolean;
    }>
  ) {
    await ensurePlatformCalendarEventSchema();
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          fields.push(`${key} = $${i++}`);
          values.push(val);
        }
      }
      if (fields.length === 0) return null;
      fields.push('updated_at = NOW()');
      values.push(id);
      const result = await client.query(
        `UPDATE platform_calendar_events SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM platform_calendar_events WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  },
};
