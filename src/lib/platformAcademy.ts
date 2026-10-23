import { pool } from './db';

export type LessonType = 'video' | 'pdf' | 'link';

export type PlatformAcademyModuleRow = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PlatformAcademyLessonRow = {
  id: number;
  module_id: number;
  lesson_code: string;
  title: string;
  lesson_type: LessonType;
  file_url: string | null;
  duration_label: string | null;
  file_size_bytes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
};

export const PlatformAcademyModule = {
  async findPublishedWithLessons(): Promise<
    Array<PlatformAcademyModuleRow & { lessons: PlatformAcademyLessonRow[] }>
  > {
    const client = await pool.connect();
    try {
      const mods = await client.query(
        `SELECT * FROM platform_academy_modules
         WHERE is_published = true
         ORDER BY sort_order ASC, id ASC`
      );
      const lessons = await client.query(
        `SELECT * FROM platform_academy_lessons
         WHERE is_published = true
         ORDER BY sort_order ASC, id ASC`
      );
      const byModule = new Map<number, PlatformAcademyLessonRow[]>();
      for (const row of lessons.rows) {
        const list = byModule.get(row.module_id) ?? [];
        list.push(row);
        byModule.set(row.module_id, list);
      }
      return mods.rows.map((m) => ({
        ...m,
        lessons: byModule.get(m.id) ?? [],
      }));
    } finally {
      client.release();
    }
  },

  async findAllAdminWithLessons(): Promise<
    Array<PlatformAcademyModuleRow & { lessons: PlatformAcademyLessonRow[] }>
  > {
    const client = await pool.connect();
    try {
      const mods = await client.query(
        `SELECT * FROM platform_academy_modules ORDER BY sort_order ASC, id ASC`
      );
      const lessons = await client.query(
        `SELECT * FROM platform_academy_lessons ORDER BY module_id ASC, sort_order ASC, id ASC`
      );
      const byModule = new Map<number, PlatformAcademyLessonRow[]>();
      for (const row of lessons.rows) {
        const list = byModule.get(row.module_id) ?? [];
        list.push(row);
        byModule.set(row.module_id, list);
      }
      return mods.rows.map((m) => ({
        ...m,
        lessons: byModule.get(m.id) ?? [],
      }));
    } finally {
      client.release();
    }
  },

  async create(data: {
    title: string;
    description?: string | null;
    sort_order?: number;
    is_published?: boolean;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO platform_academy_modules
         (title, description, sort_order, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [
          data.title,
          data.description ?? null,
          data.sort_order ?? 0,
          data.is_published ?? true,
        ]
      );
      return result.rows[0] as PlatformAcademyModuleRow;
    } finally {
      client.release();
    }
  },

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
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
        `UPDATE platform_academy_modules SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return (result.rows[0] as PlatformAcademyModuleRow) ?? null;
    } finally {
      client.release();
    }
  },

  async delete(id: number) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM platform_academy_modules WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },
};

export const PlatformAcademyLesson = {
  async create(data: {
    module_id: number;
    lesson_code: string;
    title: string;
    lesson_type: LessonType;
    file_url?: string | null;
    duration_label?: string | null;
    file_size_bytes?: number | null;
    sort_order?: number;
    is_published?: boolean;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO platform_academy_lessons
         (module_id, lesson_code, title, lesson_type, file_url, duration_label, file_size_bytes, sort_order, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [
          data.module_id,
          data.lesson_code,
          data.title,
          data.lesson_type,
          data.file_url ?? null,
          data.duration_label ?? null,
          data.file_size_bytes ?? null,
          data.sort_order ?? 0,
          data.is_published ?? true,
        ]
      );
      return result.rows[0] as PlatformAcademyLessonRow;
    } finally {
      client.release();
    }
  },

  async update(
    id: number,
    data: Partial<{
      lesson_code: string;
      title: string;
      lesson_type: LessonType;
      file_url: string | null;
      duration_label: string | null;
      file_size_bytes: number | null;
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
        `UPDATE platform_academy_lessons SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return (result.rows[0] as PlatformAcademyLessonRow) ?? null;
    } finally {
      client.release();
    }
  },

  async delete(id: number) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM platform_academy_lessons WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },
};
