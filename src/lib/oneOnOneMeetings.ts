import { pool } from './db';

export {
  ONE_ON_ONE_DURATION_MINUTES,
  ONE_ON_ONE_PRICE_USD,
  ONE_ON_ONE_PRICE_CENTS,
  ONE_ON_ONE_MIN_LEAD_HOURS,
  ONE_ON_ONE_PAYMENT_DEADLINE_HOURS_BEFORE,
  ONE_ON_ONE_SLOT_HOURS,
  ONE_ON_ONE_TIMEZONE,
  ONE_ON_ONE_TIMEZONE_LABEL,
} from './oneOnOneMeetings.constants';
import {
  ONE_ON_ONE_DURATION_MINUTES,
  ONE_ON_ONE_PRICE_CENTS,
  ONE_ON_ONE_PAYMENT_DEADLINE_HOURS_BEFORE,
} from './oneOnOneMeetings.constants';

export type { OneOnOneStatus } from './oneOnOneTypes';
export { oneOnOneStatusLabel } from './oneOnOneTypes';
import type { OneOnOneStatus } from './oneOnOneTypes';

export type OneOnOneRequestRow = {
  id: number;
  user_id: number;
  status: OneOnOneStatus;
  meeting_start_at: Date;
  duration_minutes: number;
  note: string;
  price_cents: number;
  alternative_slots: string[] | null;
  admin_message: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_deadline_at: Date | null;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type OneOnOneRequestWithUser = OneOnOneRequestRow & {
  user_email: string;
  user_full_name: string;
};

let schemaReady: Promise<void> | null = null;

export async function ensureOneOnOneSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS member_one_on_one_requests (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
            status VARCHAR(32) NOT NULL DEFAULT 'pending_admin'
              CHECK (status IN (
                'pending_admin',
                'awaiting_payment',
                'awaiting_client_slot',
                'paid',
                'declined',
                'expired',
                'cancelled'
              )),
            meeting_start_at TIMESTAMPTZ NOT NULL,
            duration_minutes INT NOT NULL DEFAULT ${ONE_ON_ONE_DURATION_MINUTES},
            note TEXT NOT NULL,
            price_cents INT NOT NULL DEFAULT ${ONE_ON_ONE_PRICE_CENTS},
            alternative_slots JSONB,
            admin_message TEXT,
            stripe_checkout_session_id VARCHAR(255),
            stripe_payment_intent_id VARCHAR(255),
            payment_deadline_at TIMESTAMPTZ,
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_one_on_one_user ON member_one_on_one_requests(user_id)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_one_on_one_status ON member_one_on_one_requests(status)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_one_on_one_start ON member_one_on_one_requests(meeting_start_at)
        `);
      } finally {
        client.release();
      }
    })();
  }
  await schemaReady;
}

export function paymentDeadlineForMeetingStart(meetingStart: Date): Date {
  return new Date(meetingStart.getTime() - ONE_ON_ONE_PAYMENT_DEADLINE_HOURS_BEFORE * 60 * 60 * 1000);
}

export function canCompletePaymentNow(request: Pick<OneOnOneRequestRow, 'meeting_start_at' | 'payment_deadline_at' | 'status'>): boolean {
  if (request.status !== 'awaiting_payment') return false;
  const now = Date.now();
  const deadline = request.payment_deadline_at
    ? new Date(request.payment_deadline_at).getTime()
    : paymentDeadlineForMeetingStart(new Date(request.meeting_start_at)).getTime();
  const meetingStart = new Date(request.meeting_start_at).getTime();
  return now < deadline && now < meetingStart;
}

export const OneOnOneRequest = {
  async create(data: {
    userId: number;
    meetingStartAt: Date;
    note: string;
  }): Promise<OneOnOneRequestRow> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO member_one_on_one_requests
           (user_id, meeting_start_at, note, status, duration_minutes, price_cents, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending_admin', $4, $5, NOW(), NOW())
         RETURNING *`,
        [data.userId, data.meetingStartAt.toISOString(), data.note, ONE_ON_ONE_DURATION_MINUTES, ONE_ON_ONE_PRICE_CENTS]
      );
      const row = result.rows[0];
      return { ...row, alternative_slots: row.alternative_slots };
    } finally {
      client.release();
    }
  },

  async expireStalePayments(): Promise<void> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE member_one_on_one_requests
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'awaiting_payment'
           AND (
             (payment_deadline_at IS NOT NULL AND payment_deadline_at < NOW())
             OR (payment_deadline_at IS NULL AND meeting_start_at - INTERVAL '3 hours' < NOW())
           )`
      );
    } finally {
      client.release();
    }
  },

  async findById(id: number): Promise<OneOnOneRequestRow | null> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT * FROM member_one_on_one_requests WHERE id = $1`, [id]);
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async listByUserId(userId: number): Promise<OneOnOneRequestRow[]> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM member_one_on_one_requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async listForAdmin(): Promise<OneOnOneRequestWithUser[]> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT r.*, u.email AS user_email, u.full_name AS user_full_name
         FROM member_one_on_one_requests r
         JOIN platform_users u ON u.id = r.user_id
         ORDER BY
           CASE r.status
             WHEN 'pending_admin' THEN 0
             WHEN 'awaiting_client_slot' THEN 1
             WHEN 'awaiting_payment' THEN 2
             ELSE 3
           END,
           r.meeting_start_at ASC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async countPendingAdmin(): Promise<number> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*)::int AS c FROM member_one_on_one_requests WHERE status = 'pending_admin'`
      );
      return result.rows[0]?.c ?? 0;
    } finally {
      client.release();
    }
  },

  async isSlotTaken(meetingStartAt: Date, excludeId?: number): Promise<boolean> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id FROM member_one_on_one_requests
         WHERE meeting_start_at = $1
           AND status IN ('pending_admin', 'awaiting_payment', 'awaiting_client_slot', 'paid')
           AND ($2::int IS NULL OR id <> $2)
         LIMIT 1`,
        [meetingStartAt.toISOString(), excludeId ?? null]
      );
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  },

  async updateStatus(
    id: number,
    patch: Partial<{
      status: OneOnOneStatus;
      meeting_start_at: Date;
      alternative_slots: string[] | null;
      admin_message: string | null;
      payment_deadline_at: Date | null;
      stripe_checkout_session_id: string | null;
      stripe_payment_intent_id: string | null;
      paid_at: Date | null;
    }>
  ): Promise<OneOnOneRequestRow | null> {
    await ensureOneOnOneSchema();
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let i = 1;

      if (patch.status !== undefined) {
        fields.push(`status = $${i++}`);
        values.push(patch.status);
      }
      if (patch.meeting_start_at !== undefined) {
        fields.push(`meeting_start_at = $${i++}`);
        values.push(patch.meeting_start_at.toISOString());
      }
      if (patch.alternative_slots !== undefined) {
        fields.push(`alternative_slots = $${i++}`);
        values.push(patch.alternative_slots ? JSON.stringify(patch.alternative_slots) : null);
      }
      if (patch.admin_message !== undefined) {
        fields.push(`admin_message = $${i++}`);
        values.push(patch.admin_message);
      }
      if (patch.payment_deadline_at !== undefined) {
        fields.push(`payment_deadline_at = $${i++}`);
        values.push(patch.payment_deadline_at ? patch.payment_deadline_at.toISOString() : null);
      }
      if (patch.stripe_checkout_session_id !== undefined) {
        fields.push(`stripe_checkout_session_id = $${i++}`);
        values.push(patch.stripe_checkout_session_id);
      }
      if (patch.stripe_payment_intent_id !== undefined) {
        fields.push(`stripe_payment_intent_id = $${i++}`);
        values.push(patch.stripe_payment_intent_id);
      }
      if (patch.paid_at !== undefined) {
        fields.push(`paid_at = $${i++}`);
        values.push(patch.paid_at ? patch.paid_at.toISOString() : null);
      }

      if (fields.length === 0) return this.findById(id);

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE member_one_on_one_requests SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },
};