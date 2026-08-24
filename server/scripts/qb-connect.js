/**
 * CLI: open Intuit OAuth, capture callback, save access + refresh tokens.
 *
 * Before running, in Intuit Developer → your app → Keys & OAuth → Redirect URIs,
 * add EXACTLY:
 *   http://localhost:3001/api/quickbooks/callback
 *
 * Usage: npm run qb:connect
 */
import http from 'http';
import open from 'open';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { buildAuthorizeUrl } from '../src/services/quickbooks/oauth.js';
import { loadTokens } from '../src/services/quickbooks/tokenStore.js';

const app = createApp();
const server = http.createServer(app);

function waitForTokens(timeoutMs = 5 * 60 * 1000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const tokens = await loadTokens();
        if (tokens?.accessToken && tokens?.refreshToken && tokens?.realmId) {
          clearInterval(timer);
          resolve(tokens);
          return;
        }
      } catch {
        /* retry */
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Timed out waiting for OAuth callback (5 min).'));
      }
    }, 500);
  });
}

server.listen(env.PORT, async () => {
  const authorizeUrl = buildAuthorizeUrl(`cli-${Date.now()}`);

  console.log('\n=== QuickBooks CLI Connect (sandbox) ===\n');
  console.log('1) Confirm Redirect URI on Intuit app Keys & OAuth:');
  console.log(`   ${env.QB_REDIRECT_URI}\n`);
  console.log('2) Browser will open — sign in and click Connect.\n');
  console.log('Authorize URL:\n', authorizeUrl, '\n');
  console.log('Tokens will be saved to database (integration_tokens table).\n');

  try {
    await open(authorizeUrl);
  } catch {
    console.log('Could not open browser automatically — paste the URL above.\n');
  }

  try {
    const tokens = await waitForTokens();
    console.log('Connected successfully.');
    console.log({
      realmId: tokens.realmId,
      environment: tokens.environment,
      accessExpiresAt: new Date(tokens.expiresAt).toISOString(),
      refreshWindowSeconds: tokens.xRefreshTokenExpiresIn,
      updatedAt: tokens.updatedAt,
    });
    console.log(
      '\nAccess token ~60 min. Refresh token is the long-lived credential (~100 days, rolling).'
    );
    console.log('Next: npm run qb:refresh   or   npm run qb:test\n');
    process.exit(0);
  } catch (err) {
    console.error('\nConnect failed:', err.message);
    process.exit(1);
  } finally {
    server.close();
  }
});
