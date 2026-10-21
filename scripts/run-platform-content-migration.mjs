import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'platform-content-migration.sql'), 'utf8');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  await client.query(sql);
  console.log('✅ platform content migration OK');
} finally {
  await client.end();
}
