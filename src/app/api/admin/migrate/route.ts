import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export const runtime = 'nodejs';

/**
 * INTERNAL ENDPOINT - Run database migrations
 * Only accessible if MIGRATION_TOKEN is provided and matches
 */
export async function POST(req: NextRequest) {
  try {
    // Security check - verify migration token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== process.env.MIGRATION_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
      console.log('🔄 Running migration: Creating contracts table...');

      // Create contracts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Contracts" (
          "Id" SERIAL PRIMARY KEY,
          "SubscriptionId" INTEGER NOT NULL REFERENCES "Subscriptions"("Id") ON DELETE CASCADE,
          "CustomerEmail" VARCHAR(255) NOT NULL,
          "CustomerName" VARCHAR(255) NOT NULL,
          "PdfContent" BYTEA NOT NULL,
          "AcceptanceDate" TIMESTAMP NOT NULL,
          "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      console.log('✅ Contracts table created');

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contracts_email ON "Contracts"("CustomerEmail")
      `);

      console.log('✅ Email index created');

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contracts_subscription ON "Contracts"("SubscriptionId")
      `);

      console.log('✅ Subscription index created');

      console.log('🔄 Running migration: Referral tables...');

      await client.query(`
        CREATE TABLE IF NOT EXISTS referral_traders (
          id SERIAL PRIMARY KEY,
          alias VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          referral_code VARCHAR(32) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_referral_traders_email ON referral_traders(email)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_referral_traders_code ON referral_traders(referral_code)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS referral_conversions (
          id SERIAL PRIMARY KEY,
          referral_trader_id INTEGER NOT NULL REFERENCES referral_traders(id) ON DELETE RESTRICT,
          referral_code VARCHAR(32) NOT NULL,
          referred_name VARCHAR(255),
          referred_email VARCHAR(255) NOT NULL,
          membership_type VARCHAR(255) NOT NULL,
          commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
          stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
          completed_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_referral_conversions_trader ON referral_conversions(referral_trader_id)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_referral_conversions_email ON referral_conversions(referred_email)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_referral_conversions_completed ON referral_conversions(completed_at DESC)
      `);

      console.log('✅ Referral tables created');

      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
