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
