import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, '../sql/002_appearance_json.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_POOLER_URL;

if (!connectionString) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
const { rows } = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'precise_timing_ai_assistant_business_settings'
    AND column_name = 'appearance_json'
`);
console.log('appearance_json column:', rows);
await client.end();
