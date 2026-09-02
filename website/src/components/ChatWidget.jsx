import { useEffect } from 'react';
import { PRODUCTION_API_URL, normalizeApiUrl } from '../lib/apiBase.js';

const EMBED_SRC = '/embed.js';

/**
 * Loads the Precise Timing AI chat widget (built in client/, copied to
 * public/embed.js). The bundle self-mounts a floating launcher bottom-right.
 *
 * Production talks to the Railway API. Local Vite uses the same-origin proxy
 * unless VITE_CHAT_API_URL is set.
 */
export default function ChatWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = EMBED_SRC;
    script.defer = true;
    const apiUrl =
      normalizeApiUrl(import.meta.env.VITE_CHAT_API_URL) ||
      (import.meta.env.PROD ? PRODUCTION_API_URL : '');
    if (apiUrl) script.setAttribute('data-api-url', apiUrl);
    document.body.appendChild(script);
  }, []);

  return null;
}
