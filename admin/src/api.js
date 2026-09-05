import { getToken, setSession } from './auth.js';

const PRODUCTION_API = 'https://precise-timing-ai-assistant-production.up.railway.app';

function resolveAdminApi() {
  const raw = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '').trim();
  if (raw.includes('precise-timing-ai-assistant-server.vercel.app')) return PRODUCTION_API;
  if (raw) return raw;
  return import.meta.env.PROD ? PRODUCTION_API : '';
}

const API = resolveAdminApi();

let sessionPromise = null;

export async function ensureAdminSession() {
  if (getToken()) return getToken();
  if (sessionPromise) return sessionPromise;

  const email = import.meta.env.VITE_ADMIN_EMAIL || 'admin@gmail.com';
  const password = import.meta.env.VITE_ADMIN_PASSWORD || 'admin@123!';

  sessionPromise = request('/api/admin/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
    .then((data) => {
      setSession({ token: data.token, email: data.email, name: data.name });
      return data.token;
    })
    .finally(() => {
      sessionPromise = null;
    });

  return sessionPromise;
}

async function request(path, { method = 'GET', body, auth = true, _retried = false } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth && !_retried) {
    setSession();
    await ensureAdminSession();
    return request(path, { method, body, auth, _retried: true });
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/admin/login', { method: 'POST', body: { email, password }, auth: false }),
  health: () => request('/health', { auth: false }),
  stats: () => request('/api/leads/stats'),
  analytics: () => request('/api/leads/analytics'),
  leads: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') q.set(k, v);
    });
    return request(`/api/leads?${q}`);
  },
  lead: (id) => request(`/api/leads/${id}`),
  updateLead: (id, patch) =>
    request(`/api/leads/${id}`, {
      method: 'PATCH',
      body: typeof patch === 'string' ? { status: patch } : patch,
    }),
  deleteLead: (id) => request(`/api/leads/${id}`, { method: 'DELETE' }),
  generateAiReply: (id, force = true) =>
    request(`/api/leads/${id}/ai-reply`, { method: 'POST', body: { force } }),
  quotes: () => request('/api/quotes?limit=100'),
  inboxStatus: () => request('/api/inbound-email/status', { auth: false }),
  pollInbox: () => request('/api/inbound-email/poll', { method: 'POST' }),
  settings: () => request('/api/business-settings'),
  saveSettings: (body) => request('/api/business-settings', { method: 'PUT', body }),
  adminUsers: () => request('/api/admin/users'),
  updateAdminUser: (id, body) => request(`/api/admin/users/${id}`, { method: 'PATCH', body }),
};
