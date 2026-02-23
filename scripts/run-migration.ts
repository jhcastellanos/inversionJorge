import { Pool } from '@neondatabase/serverless';

async function runMigration() {
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

    console.log('✅ Index on CustomerEmail created');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contracts_subscription ON "Contracts"("SubscriptionId")
    `);

    console.log('✅ Index on SubscriptionId created');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
