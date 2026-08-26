import bcrypt from 'bcryptjs';
import { query } from '../lib/db.js';
import { T } from '../db/tables.js';

export async function upsertAdminUser({ email, password, fullName = 'Admin' }) {
  const normalized = String(email).trim().toLowerCase();
  const hash = await bcrypt.hash(String(password), 10);
  const { rows } = await query(
    `INSERT INTO ${T.adminUsers} (email, password_hash, full_name, role, is_active, updated_at)
     VALUES ($1, $2, $3, 'admin', true, now())
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           is_active = true,
           updated_at = now()
     RETURNING id, email, full_name, role`,
    [normalized, hash, fullName]
  );
  return rows[0];
}

/** Ensures admin@gmail.com (or ADMIN_EMAIL) exists with the given password. */
export async function seedDefaultAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin@123!';
  return upsertAdminUser({ email, password, fullName: 'Precise Timing Admin' });
}

export async function findAdminByEmail(email) {
  const { rows } = await query(
    `SELECT * FROM ${T.adminUsers} WHERE lower(email) = lower($1) LIMIT 1`,
    [String(email || '').trim()]
  );
  return rows[0] || null;
}

export async function verifyAdminPassword(email, password) {
  const user = await findAdminByEmail(email);
  if (!user || !user.is_active || !user.password_hash) return null;
  const ok = await bcrypt.compare(String(password || ''), user.password_hash);
  if (!ok) return null;
  return user;
}
