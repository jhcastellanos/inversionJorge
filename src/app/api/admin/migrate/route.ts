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

      console.log('🔄 Running migration: platform_users...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255),
          full_name VARCHAR(255) NOT NULL,
          google_id VARCHAR(255) UNIQUE,
          stripe_customer_id VARCHAR(255),
          onboarding_completed BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users (LOWER(email))
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_platform_users_stripe ON platform_users (stripe_customer_id)
      `);
      console.log('✅ platform_users table created');

      await client.query(`
        ALTER TABLE platform_users
          ADD COLUMN IF NOT EXISTS platform_role VARCHAR(32)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform_users (platform_role)
      `);
      console.log('✅ platform_users.platform_role column ready');

      console.log('🔄 Running migration: platform content...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_classes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          section_name VARCHAR(255) NOT NULL DEFAULT 'General',
          class_level VARCHAR(16) NOT NULL CHECK (class_level IN ('basico', 'avanzado')),
          video_url TEXT,
          sort_order INT NOT NULL DEFAULT 0,
          is_published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_platform_classes_level ON platform_classes (class_level, is_published)
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_calendar_events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_level VARCHAR(16) NOT NULL CHECK (event_level IN ('basico', 'medio', 'avanzado')),
          starts_at TIMESTAMPTZ NOT NULL,
          ends_at TIMESTAMPTZ,
          is_published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_platform_events_level ON platform_calendar_events (event_level, starts_at)
      `);
      await client.query(`
        ALTER TABLE platform_calendar_events ADD COLUMN IF NOT EXISTS zoom_url TEXT
      `);
      await client.query(`
        ALTER TABLE platform_calendar_events
          ADD COLUMN IF NOT EXISTS event_kind VARCHAR(32) DEFAULT 'clase_en_vivo'
      `);
      await client.query(`
        UPDATE platform_calendar_events SET event_kind = 'clase_en_vivo' WHERE event_kind IS NULL
      `);
      await client.query(`
        ALTER TABLE platform_calendar_events
          ADD COLUMN IF NOT EXISTS event_tier VARCHAR(32) DEFAULT 'clase_retrospectiva'
      `);
      await client.query(`
        ALTER TABLE platform_calendar_events
          ADD COLUMN IF NOT EXISTS force_live BOOLEAN DEFAULT false
      `);
      await client.query(`
        UPDATE platform_calendar_events SET force_live = false WHERE force_live IS NULL
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_academy_modules (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          sort_order INT NOT NULL DEFAULT 0,
          is_published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_academy_lessons (
          id SERIAL PRIMARY KEY,
          module_id INT NOT NULL REFERENCES platform_academy_modules(id) ON DELETE CASCADE,
          lesson_code VARCHAR(32) NOT NULL DEFAULT '1.1',
          title VARCHAR(255) NOT NULL,
          lesson_type VARCHAR(16) NOT NULL CHECK (lesson_type IN ('video', 'pdf', 'link')),
          file_url TEXT,
          duration_label VARCHAR(32),
          file_size_bytes BIGINT,
          sort_order INT NOT NULL DEFAULT 0,
          is_published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ platform content tables ready');

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
