import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = env.DATABASE_URL || env.DATABASE_POOLER_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for Postgres access');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}
