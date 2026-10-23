import { pool } from './db';

let schemaReady: Promise<void> | null = null;

export async function ensureAcademyProgressSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS platform_academy_lesson_progress (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
            lesson_id INT NOT NULL REFERENCES platform_academy_lessons(id) ON DELETE CASCADE,
            completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, lesson_id)
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_academy_progress_user
          ON platform_academy_lesson_progress (user_id)
        `);
      } finally {
        client.release();
      }
    })();
  }
  await schemaReady;
}

export async function getCompletedLessonIds(userId: number, lessonIds: number[]): Promise<number[]> {
  if (lessonIds.length === 0) return [];
  await ensureAcademyProgressSchema();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT lesson_id FROM platform_academy_lesson_progress
       WHERE user_id = $1 AND lesson_id = ANY($2::int[])`,
      [userId, lessonIds]
    );
    return result.rows.map((r) => Number(r.lesson_id));
  } finally {
    client.release();
  }
}

export async function markLessonComplete(userId: number, lessonId: number): Promise<void> {
  await ensureAcademyProgressSchema();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO platform_academy_lesson_progress (user_id, lesson_id, completed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed_at = NOW()`,
      [userId, lessonId]
    );
  } finally {
    client.release();
  }
}
