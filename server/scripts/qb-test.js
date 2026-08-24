/**
 * Call CompanyInfo using auto-refreshed access token.
 * Usage: npm run qb:test
 */
import { getCompanyInfo } from '../src/services/quickbooks/client.js';
import { loadTokens } from '../src/services/quickbooks/tokenStore.js';

try {
  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error('Not connected. Run: npm run qb:connect');
  }

  const company = await getCompanyInfo();
  const info = company?.CompanyInfo;
  console.log('QuickBooks API OK');
  console.log({
    realmId: tokens.realmId,
    companyName: info?.CompanyName || info?.LegalName,
    country: info?.Country,
  });
} catch (err) {
  console.error('Test failed:', err.message);
  if (err.payload) console.error(JSON.stringify(err.payload, null, 2));
  process.exit(1);
}
