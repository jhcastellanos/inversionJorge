import { pool } from './db';

let schemaReady: Promise<void> | null = null;

export async function ensureAlumnoPackagePurchasesSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS alumno_package_purchases (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
            stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
            purchased_at TIMESTAMPTZ NOT NULL,
            access_until TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
      } finally {
        client.release();
      }
    })();
  }
  await schemaReady;
}

export async function recordAlumnoPackagePurchaseIfNew(data: {
  userId: number;
  stripeCheckoutSessionId: string;
  purchasedAt: Date;
  accessUntil: Date;
}): Promise<boolean> {
  await ensureAlumnoPackagePurchasesSchema();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO alumno_package_purchases (user_id, stripe_checkout_session_id, purchased_at, access_until)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (stripe_checkout_session_id) DO NOTHING
       RETURNING id`,
      [
        data.userId,
        data.stripeCheckoutSessionId,
        data.purchasedAt.toISOString(),
        data.accessUntil.toISOString(),
      ]
    );
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}