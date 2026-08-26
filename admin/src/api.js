import { getToken, setToken } from './auth.js';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, { method = 'GET', body, auth = true } = {}) {
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
  if (res.status === 401) {
    setToken('');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (password) => request('/api/admin/login', { method: 'POST', body: { password }, auth: false }),
  health: () => request('/health', { auth: false }),
  stats: () => request('/api/leads/stats'),
  leads: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') q.set(k, v);
    });
    return request(`/api/leads?${q}`);
  },
  lead: (id) => request(`/api/leads/${id}`),
  updateLead: (id, status) => request(`/api/leads/${id}`, { method: 'PATCH', body: { status } }),
  quotes: () => request('/api/quotes?limit=100'),
  inboxStatus: () => request('/api/inbound-email/status', { auth: false }),
  pollInbox: () => request('/api/inbound-email/poll', { method: 'POST' }),
};
