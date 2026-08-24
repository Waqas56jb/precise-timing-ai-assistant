/**
 * Migrate QuickBooks tokens from data/quickbooks-tokens.json → DB.
 * Usage: npm run qb:migrate-tokens
 */
import { migrateFileTokensToDb } from '../src/services/quickbooks/tokenStore.js';
import { loadTokens } from '../src/services/quickbooks/tokenStore.js';

const result = await migrateFileTokensToDb();
console.log('Migration result:', result);

const tokens = await loadTokens();
if (tokens) {
  console.log('Loaded from DB:', {
    realmId: tokens.realmId,
    environment: tokens.environment,
    updatedAt: tokens.updatedAt,
  });
} else {
  console.log('No tokens found.');
}
