import { qbApiBase } from '../../config/env.js';
import { getValidAccessToken } from './oauth.js';
import { loadTokens } from './tokenStore.js';

export async function qbFetch(pathname, options = {}) {
  const tokens = await loadTokens();
  if (!tokens?.realmId) {
    throw new Error('Missing realmId. Re-run: npm run qb:connect');
  }

  const accessToken = await getValidAccessToken();
  const url = `${qbApiBase}${pathname.replace('{realmId}', tokens.realmId)}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(`QuickBooks API ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export async function getCompanyInfo() {
  const tokens = await loadTokens();
  return qbFetch(`/v3/company/${tokens.realmId}/companyinfo/${tokens.realmId}`);
}
