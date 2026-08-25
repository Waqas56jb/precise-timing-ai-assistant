import React from 'react';
import { createRoot } from 'react-dom/client';
import Widget, { ChatIcon } from './Widget.jsx';
import widgetCss from './widget.css?inline';
import {
  createApi,
  getVisitorId,
  getStoredConversationId,
  setStoredConversationId,
} from './api.js';

const STYLE_ID = 'precise-timing-chat-styles';
const HOST_ID = 'precise-timing-chat-widget';

function resolveApiUrl(script) {
  const attr = script?.getAttribute('data-api-url');
  if (attr?.trim()) return attr.trim();

  if (typeof window !== 'undefined') {
    const { hostname, port, origin } = window.location;

    // Local Vite preview → hit backend directly (CORS enabled on server)
    if (port === '5173' || port === '4173' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3001';
    }

    // Known Vercel frontend hosts → production API
    if (
      hostname.includes('precise-timing-ai-assistant-website') ||
      hostname.includes('precise-timing-ai-assistant-client') ||
      hostname.endsWith('.vercel.app')
    ) {
      return 'https://precise-timing-ai-assistant-server.vercel.app';
    }

    // Same-origin deploy (API proxied / hosted together)
    return origin;
  }
  return 'https://precise-timing-ai-assistant-server.vercel.app';
}

function getConfigFromScript() {
  const script =
    document.currentScript ||
    document.querySelector('script[data-api-url]') ||
    document.querySelector('script[src*="embed"]');

  return {
    apiUrl: resolveApiUrl(script),
    mode: script?.getAttribute('data-mode') || 'float',
    autoOpen: script?.getAttribute('data-auto-open') === 'true',
  };
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = widgetCss;
  document.head.appendChild(style);
}

function App({ apiBase, mode = 'float', autoOpen = false }) {
  const isCenter = mode === 'center';
  const [open, setOpen] = React.useState(isCenter || autoOpen);

  const api = React.useMemo(
    () => ({
      ...createApi(apiBase),
      visitorId: getVisitorId(),
      getConversationId: getStoredConversationId,
      setConversationId: setStoredConversationId,
    }),
    [apiBase]
  );

  if (isCenter) {
    return (
      <div className="pt-widget pt-widget--center">
        <Widget api={api} isOpen mode="center" />
      </div>
    );
  }

  return (
    <div className="pt-widget pt-widget--float">
      <button
        type="button"
        className={`pt-launcher ${open ? 'pt-launcher--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <ChatIcon />
        )}
      </button>
      {open && (
        <Widget api={api} isOpen={open} mode="float" onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export function mountWidget(options = {}) {
  if (window.__PT_CHAT_MOUNTED__) return;
  window.__PT_CHAT_MOUNTED__ = true;

  const fromScript = getConfigFromScript();
  const apiUrl = options.apiUrl || fromScript.apiUrl;
  const mode = options.mode || fromScript.mode;
  const autoOpen = options.autoOpen ?? fromScript.autoOpen;

  injectStyles();

  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
  }

  const root = createRoot(host);
  root.render(<App apiBase={apiUrl} mode={mode} autoOpen={autoOpen} />);
}

if (typeof window !== 'undefined') {
  const boot = () => mountWidget();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.PreciseTimingChat = { mount: mountWidget };
}
