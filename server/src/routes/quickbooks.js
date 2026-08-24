import { Router } from 'express';
import {
  buildAuthorizeUrl,
  exchangeAuthorizationCode,
  getValidAccessToken,
  refreshAccessToken,
} from '../services/quickbooks/oauth.js';
import { getCompanyInfo } from '../services/quickbooks/client.js';
import { loadTokens } from '../services/quickbooks/tokenStore.js';

const router = Router();

router.get('/connect', (_req, res) => {
  res.redirect(buildAuthorizeUrl());
});

router.get('/callback', async (req, res) => {
  try {
    const { code, realmId, state, error, error_description: errorDescription } =
      req.query;

    if (error) {
      return res
        .status(400)
        .send(`QuickBooks auth error: ${error} — ${errorDescription || ''}`);
    }

    if (!code || !realmId) {
      return res.status(400).send('Missing code or realmId in callback.');
    }

    const tokens = await exchangeAuthorizationCode(String(code), String(realmId));

    res.type('html').send(`<!doctype html>
<html><body style="font-family:sans-serif;padding:2rem">
  <h1>QuickBooks connected</h1>
  <p>Realm ID: <code>${tokens.realmId}</code></p>
  <p>Tokens saved to database.</p>
  <p>You can close this tab.</p>
  <pre>${JSON.stringify(
    { realmId: tokens.realmId, expiresAt: tokens.expiresAt, state: state || null },
    null,
    2
  )}</pre>
</body></html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Token exchange failed: ${err.message}`);
  }
});

router.get('/status', async (_req, res) => {
  try {
    const tokens = await loadTokens();
    if (!tokens) {
      return res.json({ connected: false, storage: 'database' });
    }
    res.json({
      connected: true,
      storage: 'database',
      realmId: tokens.realmId,
      environment: tokens.environment,
      expiresAt: tokens.expiresAt,
      accessTokenValid: Date.now() < (tokens.expiresAt || 0),
      updatedAt: tokens.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

router.post('/refresh', async (_req, res) => {
  try {
    const tokens = await refreshAccessToken();
    res.json({
      ok: true,
      realmId: tokens.realmId,
      expiresAt: tokens.expiresAt,
      updatedAt: tokens.updatedAt,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      ok: false,
      error: err.message,
      payload: err.payload || null,
    });
  }
});

router.get('/company', async (_req, res) => {
  try {
    await getValidAccessToken();
    const company = await getCompanyInfo();
    res.json(company);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message,
      payload: err.payload || null,
    });
  }
});

export default router;
