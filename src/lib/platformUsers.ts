import { pool } from './db';

export type PlatformUserRow = {
  id: number;
  email: string;
  password_hash: string | null;
  full_name: string;
  google_id: string | null;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
};

export const PlatformUser = {
  async findByEmail(email: string): Promise<PlatformUserRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM platform_users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email.trim()]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async findById(id: number): Promise<PlatformUserRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM platform_users WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async findByGoogleId(googleId: string): Promise<PlatformUserRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM platform_users WHERE google_id = $1 LIMIT 1',
        [googleId]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async create(data: {
    email: string;
    full_name: string;
    password_hash?: string | null;
    google_id?: string | null;
  }): Promise<PlatformUserRow> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO platform_users (email, full_name, password_hash, google_id, created_at, updated_at)
         VALUES (LOWER($1), $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [data.email.trim(), data.full_name.trim(), data.password_hash ?? null, data.google_id ?? null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateStripeCustomerId(id: number, stripeCustomerId: string | null) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [stripeCustomerId, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async setOnboardingCompleted(id: number, completed: boolean) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users SET onboarding_completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [completed, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async linkGoogleId(id: number, googleId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users SET google_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [googleId, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async findAll(): Promise<PlatformUserRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM platform_users ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  },
};
