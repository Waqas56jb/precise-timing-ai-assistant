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

export async function listAdminUsers() {
  const { rows } = await query(
    `SELECT id, email, full_name, role, is_active, created_at, updated_at
     FROM ${T.adminUsers}
     ORDER BY created_at ASC`
  );
  return rows;
}

export async function updateAdminUser(id, patch = {}) {
  const { rows: existing } = await query(
    `SELECT * FROM ${T.adminUsers} WHERE id = $1`,
    [id]
  );
  const current = existing[0];
  if (!current) return null;

  let passwordHash = current.password_hash;
  if (patch.password) {
    if (String(patch.password).length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.status = 400;
      throw err;
    }
    passwordHash = await bcrypt.hash(String(patch.password), 10);
  }

  const { rows } = await query(
    `UPDATE ${T.adminUsers}
     SET full_name = $1,
         is_active = $2,
         password_hash = $3,
         updated_at = now()
     WHERE id = $4
     RETURNING id, email, full_name, role, is_active, created_at, updated_at`,
    [
      patch.full_name !== undefined ? patch.full_name : current.full_name,
      patch.is_active !== undefined ? Boolean(patch.is_active) : current.is_active,
      passwordHash,
      id,
    ]
  );
  return rows[0] || null;
}
