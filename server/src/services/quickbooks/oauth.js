import { env, qbAuthBase, qbTokenUrl } from '../../config/env.js';
import { loadTokens, saveTokens } from './tokenStore.js';

function basicAuthHeader() {
  const raw = `${env.QB_CLIENT_ID}:${env.QB_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

export function buildAuthorizeUrl(state = 'qb-connect') {
  const params = new URLSearchParams({
    client_id: env.QB_CLIENT_ID,
    response_type: 'code',
    scope: env.QB_SCOPES,
    redirect_uri: env.QB_REDIRECT_URI,
    state,
  });
  return `${qbAuthBase}?${params.toString()}`;
}

async function postToken(body) {
  const res = await fetch(qbTokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data.error_description || data.error || `Token request failed (${res.status})`
    );
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function exchangeAuthorizationCode(code, realmId) {
  const data = await postToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.QB_REDIRECT_URI,
  });

  const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
  const existing = await loadTokens();

  return saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    expiresAt,
    xRefreshTokenExpiresIn: data.x_refresh_token_expires_in,
    realmId: realmId || existing?.realmId || null,
    environment: env.QB_ENVIRONMENT,
  });
}

export async function refreshAccessToken(refreshToken) {
  const current = refreshToken || (await loadTokens())?.refreshToken;
  if (!current) {
    throw new Error('No refresh token stored. Run: npm run qb:connect');
  }

  const data = await postToken({
    grant_type: 'refresh_token',
    refresh_token: current,
  });

  const prev = (await loadTokens()) || {};
  const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;

  return saveTokens({
    ...prev,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || current,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    expiresAt,
    xRefreshTokenExpiresIn:
      data.x_refresh_token_expires_in ?? prev.xRefreshTokenExpiresIn,
  });
}

export async function getValidAccessToken() {
  const tokens = await loadTokens();
  if (!tokens?.refreshToken) {
    throw new Error('QuickBooks not connected. Run: npm run qb:connect');
  }

  const skewMs = 2 * 60 * 1000;
  if (tokens.accessToken && tokens.expiresAt && Date.now() < tokens.expiresAt - skewMs) {
    return tokens.accessToken;
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  return refreshed.accessToken;
}
