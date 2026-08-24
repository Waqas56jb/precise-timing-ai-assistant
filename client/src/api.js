const VISITOR_KEY = 'pt_visitor_id';
const CONVERSATION_KEY = 'pt_conversation_id';

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v_${Date.now()}`;
  }
}

export function getStoredConversationId() {
  try {
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

export function setStoredConversationId(id) {
  try {
    if (id) localStorage.setItem(CONVERSATION_KEY, id);
  } catch {
    /* ignore */
  }
}

export function createApi(apiBase) {
  const base = apiBase.replace(/\/$/, '');

  async function request(path, options = {}) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, options);
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error(
          `Cannot reach backend at ${base}. Start server: cd server && npm run dev`
        );
      }
      throw err;
    }
  }

  return {
    baseUrl: base,

    getWelcome() {
      return request('/api/chat/welcome');
    },

    sendMessage({ message, conversationId, visitorId }) {
      const body = { message };
      if (conversationId) body.conversationId = conversationId;
      if (visitorId) body.visitorId = visitorId;
      return request('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
  };
}
