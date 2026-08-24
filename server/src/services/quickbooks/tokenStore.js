import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { query } from '../../lib/db.js';
import { T } from '../../db/tables.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
const tokenPath = path.join(dataDir, 'quickbooks-tokens.json');

const PROVIDER = 'quickbooks';

function rowToTokens(row) {
  if (!row) return null;
  const meta = row.metadata || {};
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenType: row.token_type,
    expiresIn: meta.expiresIn ?? null,
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
    xRefreshTokenExpiresIn: meta.xRefreshTokenExpiresIn ?? null,
    realmId: row.realm_id,
    environment: row.environment,
    updatedAt: row.updated_at,
  };
}

function tokensToRow(tokens) {
  const expiresAt = tokens.expiresAt
    ? new Date(tokens.expiresAt).toISOString()
    : null;
  const refreshExpiresAt =
    tokens.xRefreshTokenExpiresIn != null
      ? new Date(Date.now() + tokens.xRefreshTokenExpiresIn * 1000).toISOString()
      : null;

  return {
    provider: PROVIDER,
    environment: tokens.environment || env.QB_ENVIRONMENT,
    realm_id: tokens.realmId,
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_type: tokens.tokenType,
    expires_at: expiresAt,
    refresh_expires_at: refreshExpiresAt,
    metadata: {
      expiresIn: tokens.expiresIn,
      xRefreshTokenExpiresIn: tokens.xRefreshTokenExpiresIn,
    },
  };
}

function loadTokensFromFile() {
  try {
    if (!fs.existsSync(tokenPath)) return null;
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  } catch {
    return null;
  }
}

async function loadTokensFromDb() {
  const { rows } = await query(
    `SELECT * FROM ${T.integrationTokens}
     WHERE provider = $1 AND environment = $2
     ORDER BY updated_at DESC
     LIMIT 1`,
    [PROVIDER, env.QB_ENVIRONMENT]
  );
  return rowToTokens(rows[0]);
}

export async function loadTokens() {
  try {
    const fromDb = await loadTokensFromDb();
    if (fromDb) return fromDb;
  } catch (err) {
    console.warn('QB token DB read failed, trying file:', err.message);
  }
  return loadTokensFromFile();
}

export async function saveTokens(payload) {
  const next = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  const row = tokensToRow(next);

  await query(
    `INSERT INTO ${T.integrationTokens}
       (provider, environment, realm_id, access_token, refresh_token, token_type,
        expires_at, refresh_expires_at, metadata, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (provider, environment, realm_id)
     DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       token_type = EXCLUDED.token_type,
       expires_at = EXCLUDED.expires_at,
       refresh_expires_at = EXCLUDED.refresh_expires_at,
       metadata = EXCLUDED.metadata,
       updated_at = now()
     RETURNING *`,
    [
      row.provider,
      row.environment,
      row.realm_id,
      row.access_token,
      row.refresh_token,
      row.token_type,
      row.expires_at,
      row.refresh_expires_at,
      JSON.stringify(row.metadata),
    ]
  );

  return next;
}

export async function clearTokens() {
  await query(
    `DELETE FROM ${T.integrationTokens}
     WHERE provider = $1 AND environment = $2`,
    [PROVIDER, env.QB_ENVIRONMENT]
  );
  if (fs.existsSync(tokenPath)) fs.unlinkSync(tokenPath);
}

export function getTokenPath() {
  return tokenPath;
}

/** One-time: copy file tokens into DB if DB row missing. */
export async function migrateFileTokensToDb() {
  const existing = await loadTokensFromDb().catch(() => null);
  if (existing) {
    return { migrated: false, reason: 'already_in_db', realmId: existing.realmId };
  }

  const fromFile = loadTokensFromFile();
  if (!fromFile?.refreshToken) {
    return { migrated: false, reason: 'no_file_tokens' };
  }

  await saveTokens(fromFile);
  return { migrated: true, realmId: fromFile.realmId };
}
