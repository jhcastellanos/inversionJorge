import { Pool } from '@neondatabase/serverless';
import { REFERRAL_COMMISSION_USD } from './referralConstants';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

/** Builds a unique referral code from alias + random suffix. */
export function buildReferralCodeFromAlias(alias: string): string {
  const base = alias
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 12) || 'TRADER';
  return `${base}${randomSuffix(4)}`;
}

export type ReferralTraderRow = {
  id: number;
  alias: string;
  email: string;
  referral_code: string;
  created_at: Date;
  updated_at: Date;
};

export type ReferralConversionRow = {
  id: number;
  referral_trader_id: number;
  referral_code: string;
  referred_name: string | null;
  referred_email: string;
  membership_type: string;
  commission_amount: string | number;
  stripe_subscription_id: string;
  completed_at: Date;
  created_at: Date;
  updated_at: Date;
  trader_alias?: string;
  trader_email?: string;
};

export const ReferralTrader = {
  async findAll(): Promise<ReferralTraderRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referral_traders ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findByCode(code: string): Promise<ReferralTraderRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referral_traders WHERE UPPER(referral_code) = UPPER($1)',
        [code.trim()]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async findById(id: number): Promise<ReferralTraderRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM referral_traders WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },

  async create(data: { alias: string; email: string }): Promise<ReferralTraderRow> {
    const client = await pool.connect();
    try {
      const alias = data.alias.trim();
      const email = data.email.trim().toLowerCase();

      for (let attempt = 0; attempt < 8; attempt++) {
        const referral_code = buildReferralCodeFromAlias(alias);
        try {
          const result = await client.query(
            `INSERT INTO referral_traders (alias, email, referral_code, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING *`,
            [alias, email, referral_code]
          );
          return result.rows[0];
        } catch (err: unknown) {
          const pgCode = (err as { code?: string })?.code;
          if (pgCode === '23505') continue;
          throw err;
        }
      }
      throw new Error('No se pudo generar un código de referido único');
    } finally {
      client.release();
    }
  },

  async delete(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      const count = await client.query(
        'SELECT COUNT(*)::int AS count FROM referral_conversions WHERE referral_trader_id = $1',
        [id]
      );
      if (count.rows[0].count > 0) {
        throw new Error(
          'No se puede eliminar: este referidor tiene conversiones registradas'
        );
      }
      const result = await client.query('DELETE FROM referral_traders WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        throw new Error('Referidor no encontrado');
      }
    } finally {
      client.release();
    }
  },
};

export const ReferralConversion = {
  async findAllWithTrader(): Promise<ReferralConversionRow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, t.alias AS trader_alias, t.email AS trader_email
         FROM referral_conversions c
         JOIN referral_traders t ON c.referral_trader_id = t.id
         ORDER BY c.completed_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<ReferralConversionRow | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referral_conversions WHERE stripe_subscription_id = $1',
        [stripeSubscriptionId]
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  },
};

export type RecordReferralConversionInput = {
  referralCode: string;
  referredEmail: string;
  referredName: string;
  membershipType: string;
  stripeSubscriptionId: string;
  completedAt?: Date;
};

/**
 * Idempotent: records one conversion per Stripe subscription when payment succeeds.
 * Returns the conversion row or null if code invalid / already recorded.
 */
export async function recordReferralConversionIfEligible(
  input: RecordReferralConversionInput
): Promise<ReferralConversionRow | null> {
  const code = input.referralCode?.trim();
  if (!code || !input.stripeSubscriptionId || !input.referredEmail) {
    return null;
  }

  const existing = await ReferralConversion.findByStripeSubscriptionId(
    input.stripeSubscriptionId
  );
  if (existing) {
    return existing;
  }

  const trader = await ReferralTrader.findByCode(code);
  if (!trader) {
    console.warn(`⚠️ Referral code not found: ${code}`);
    return null;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO referral_conversions (
         referral_trader_id, referral_code, referred_name, referred_email,
         membership_type, commission_amount, stripe_subscription_id,
         completed_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (stripe_subscription_id) DO NOTHING
       RETURNING *`,
      [
        trader.id,
        trader.referral_code,
        input.referredName || null,
        input.referredEmail.trim().toLowerCase(),
        input.membershipType,
        REFERRAL_COMMISSION_USD,
        input.stripeSubscriptionId,
        input.completedAt ?? new Date(),
      ]
    );
    return result.rows[0] ?? (await ReferralConversion.findByStripeSubscriptionId(
      input.stripeSubscriptionId
    ));
  } finally {
    client.release();
  }
}
