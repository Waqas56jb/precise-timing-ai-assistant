export const PRODUCTION_API_URL =
  'https://precise-timing-ai-assistant-production.up.railway.app';

/** Treat the retired Vercel API as Railway so stale Vercel env vars still work. */
export function normalizeApiUrl(url) {
  const raw = String(url || '').replace(/\/$/, '').trim();
  if (!raw) return '';
  if (raw.includes('precise-timing-ai-assistant-server.vercel.app')) {
    return PRODUCTION_API_URL;
  }
  return raw;
}

export function resolveApiBase() {
  const fromEnv = normalizeApiUrl(import.meta.env.VITE_CHAT_API_URL);
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (port === '5173' || port === '4173' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3001';
    }
  }
  return PRODUCTION_API_URL;
}
