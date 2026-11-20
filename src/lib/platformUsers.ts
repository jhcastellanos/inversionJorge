import { pool } from './db';

export type PlatformUserRow = {
  id: number;
  email: string;
  password_hash: string | null;
  full_name: string;
  google_id: string | null;
  stripe_customer_id: string | null;
  discord_user_id: string | null;
  platform_role: string | null;
  platform_role_manual?: boolean;
  alumno_access_until: Date | null;
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
        `INSERT INTO platform_users (email, full_name, password_hash, google_id, platform_role, created_at, updated_at)
         VALUES (LOWER($1), $2, $3, $4, 'visitante', NOW(), NOW())
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

  /** Solo sincronización automática (Stripe/cron). Respeta `platform_role_manual`. */
  async updatePlatformRoleFromSync(id: number, role: string): Promise<PlatformUserRow | null> {
    const { ensurePlatformUserRoleManualSchema } = await import('./platformUserRoleManualSchema');
    await ensurePlatformUserRoleManualSchema();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users
         SET platform_role = $1, updated_at = NOW()
         WHERE id = $2 AND platform_role_manual = false
         RETURNING *`,
        [role, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  /** Asignación desde panel admin: no la sobrescribe el bot ni el cron. */
  async setPlatformRoleFromAdmin(id: number, role: string | null): Promise<PlatformUserRow | null> {
    const { ensurePlatformUserRoleManualSchema } = await import('./platformUserRoleManualSchema');
    await ensurePlatformUserRoleManualSchema();
    const client = await pool.connect();
    try {
      const manual = role !== null;
      const result = await client.query(
        `UPDATE platform_users
         SET platform_role = $1, platform_role_manual = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [role, manual, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async updateAlumnoAccessUntil(id: number, accessUntil: Date | null) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users SET alumno_access_until = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [accessUntil, id]
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

  async deleteById(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM platform_users WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
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

  async listForMembershipSync(): Promise<PlatformUserRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM platform_users
         WHERE stripe_customer_id IS NOT NULL
            OR discord_user_id IS NOT NULL
            OR (alumno_access_until IS NOT NULL AND alumno_access_until > NOW())
         ORDER BY id ASC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async setDiscordUserId(id: number, discordUserId: string | null) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE platform_users SET discord_user_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [discordUserId, id]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async linkStripeCustomer(id: number, stripeCustomerId: string) {
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
};
