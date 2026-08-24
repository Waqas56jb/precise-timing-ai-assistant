/**
 * Apply schema via Postgres CLI connection.
 * SAFE: only CREATE TABLE IF NOT EXISTS — does not drop or alter other projects' tables.
 *
 * Usage: npm run db:migrate
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(
  __dirname,
  '../sql/001_precise_timing_ai_assistant_schema.sql'
);

const urls = [
  process.env.DATABASE_URL,
  process.env.DATABASE_POOLER_URL,
].filter(Boolean);

if (!urls.length) {
  console.error('Missing DATABASE_URL (or DATABASE_POOLER_URL) in .env');
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

async function listOurTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name LIKE 'precise_timing_ai_assistant_%'
    ORDER BY table_name
  `);
  return rows.map((r) => r.table_name);
}

async function listOtherTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'precise_timing_ai_assistant_%'
    ORDER BY table_name
  `);
  return rows.map((r) => r.table_name);
}

async function runWithUrl(connectionString) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const beforeOther = await listOtherTables(client);
    console.log(
      `\nExisting other project tables (untouched): ${beforeOther.length}`
    );
    if (beforeOther.length) {
      console.log(beforeOther.map((t) => `  - ${t}`).join('\n'));
    }

    console.log('\nApplying:', path.basename(sqlPath));
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const ours = await listOurTables(client);
    console.log(`\nprecise_timing_ai_assistant_* tables (${ours.length}):`);
    ours.forEach((t) => console.log(`  - ${t}`));

    const afterOther = await listOtherTables(client);
    if (afterOther.length !== beforeOther.length) {
      throw new Error('Other tables count changed — aborting safety check');
    }
    console.log('\nSafety check OK: other tables unchanged.');
    return true;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    await client.end();
  }
}

let lastError;
for (const url of urls) {
  const host = url.replace(/:[^:@/]+@/, ':****@');
  console.log('Connecting:', host);
  try {
    await runWithUrl(url);
    process.exit(0);
  } catch (err) {
    lastError = err;
    console.error('Failed with this URL:', err.message);
  }
}

console.error('\nMigration failed:', lastError?.message || lastError);
process.exit(1);
