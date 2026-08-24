/**
 * Refresh short-lived access token using stored refresh_token.
 * Usage: npm run qb:refresh
 */
import { refreshAccessToken } from '../src/services/quickbooks/oauth.js';
import { getTokenPath } from '../src/services/quickbooks/tokenStore.js';

try {
  const tokens = await refreshAccessToken();
  console.log('Access token refreshed.');
  console.log({
    realmId: tokens.realmId,
    accessExpiresAt: new Date(tokens.expiresAt).toISOString(),
    refreshWindowSeconds: tokens.xRefreshTokenExpiresIn,
    tokenFile: getTokenPath(),
    updatedAt: tokens.updatedAt,
  });
  console.log(
    '\nNote: Intuit may rotate refresh_token — latest value was saved automatically.'
  );
} catch (err) {
  console.error('Refresh failed:', err.message);
  if (err.payload) console.error(err.payload);
  console.error('\nIf invalid_grant: run npm run qb:connect again.');
  process.exit(1);
}
