import { pool } from './db';
import type { SupportTicketRow, SupportTicketWithUser } from './supportTicketTypes';

export type { SupportTicketRow, SupportTicketStatus, SupportTicketWithUser } from './supportTicketTypes';
export { memberTicketStatusLabel } from './supportTicketTypes';

let schemaReady: Promise<void> | null = null;

export async function ensureSupportTicketsSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS member_support_tickets (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
            title VARCHAR(200),
            body TEXT NOT NULL,
            is_anonymous BOOLEAN NOT NULL DEFAULT false,
            status VARCHAR(20) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'read', 'answered', 'closed')),
            admin_response TEXT,
            read_at TIMESTAMPTZ,
            answered_at TIMESTAMPTZ,
            answered_by_user_id INT REFERENCES platform_users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON member_support_tickets(user_id)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON member_support_tickets(status)
        `);
      } finally {
        client.release();
      }
    })();
  }
  await schemaReady;
}

export const SupportTicket = {
  async create(data: {
    userId: number;
    title: string | null;
    body: string;
    isAnonymous: boolean;
  }): Promise<SupportTicketRow> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO member_support_tickets (user_id, title, body, is_anonymous, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'open', NOW(), NOW())
         RETURNING *`,
        [data.userId, data.title, data.body, data.isAnonymous]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async listByUserId(userId: number): Promise<SupportTicketRow[]> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM member_support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async listForAdmin(): Promise<SupportTicketWithUser[]> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT t.*, u.email AS user_email, u.full_name AS user_full_name
         FROM member_support_tickets t
         JOIN platform_users u ON u.id = t.user_id
         ORDER BY
           CASE t.status WHEN 'open' THEN 0 WHEN 'read' THEN 1 ELSE 2 END,
           t.created_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async countOpen(): Promise<number> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*)::int AS c FROM member_support_tickets WHERE status = 'open'`
      );
      return result.rows[0]?.c ?? 0;
    } finally {
      client.release();
    }
  },

  async findById(id: number): Promise<SupportTicketRow | null> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT * FROM member_support_tickets WHERE id = $1`, [id]);
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async markRead(id: number): Promise<SupportTicketRow | null> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE member_support_tickets
         SET status = CASE WHEN status = 'open' THEN 'read' ELSE status END,
             read_at = COALESCE(read_at, NOW()),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async respond(
    id: number,
    adminUserId: number | null,
    response: string
  ): Promise<SupportTicketRow | null> {
    await ensureSupportTicketsSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE member_support_tickets
         SET admin_response = $2,
             status = 'answered',
             answered_at = NOW(),
             answered_by_user_id = $3,
             read_at = COALESCE(read_at, NOW()),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, response, adminUserId ?? null]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },
};