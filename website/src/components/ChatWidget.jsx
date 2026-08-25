import { useEffect } from 'react';

const EMBED_SRC = '/embed.js';

/**
 * Loads the Precise Timing AI chat widget (built in client/, copied to
 * public/embed.js). The bundle self-mounts a floating launcher bottom-right.
 *
 * API resolution: set VITE_CHAT_API_URL to point at the backend explicitly;
 * otherwise the widget auto-detects (dev on :5173 → http://127.0.0.1:3001,
 * production → same origin).
 */
export default function ChatWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = EMBED_SRC;
    script.defer = true;
    const apiUrl = import.meta.env.VITE_CHAT_API_URL;
    if (apiUrl) script.setAttribute('data-api-url', apiUrl);
    document.body.appendChild(script);
  }, []);

  return null;
}
