/**
 * Yelp Fusion API (public business search) — NOT the partner-only Leads API.
 * Docs: https://docs.developer.yelp.com/docs/fusion-intro
 */

const FUSION_BASE = 'https://api.yelp.com/v3';

function getApiKey() {
  return process.env.YELP_API_KEY || process.env.YELP_FUSION_API_KEY || '';
}

export function isYelpFusionConfigured() {
  return Boolean(getApiKey());
}

async function fusionFetch(path, query = {}) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('YELP_API_KEY is not set');
    err.status = 503;
    throw err;
  }

  const url = new URL(`${FUSION_BASE}${path}`);
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.description || data?.error?.code || `Yelp Fusion ${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

/** Look up a business by Yelp business id. */
export async function getYelpBusiness(businessId) {
  return fusionFetch(`/businesses/${encodeURIComponent(businessId)}`);
}

/** Search businesses (optional helper for admin later). */
export async function searchYelpBusinesses({ term, location, limit = 5 } = {}) {
  return fusionFetch('/businesses/search', {
    term: term || 'movers',
    location: location || 'United States',
    limit,
  });
}
