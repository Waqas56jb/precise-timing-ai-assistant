import React from 'react';
import { renderMarkdown } from './markdown.js';

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    </svg>
  );
}

function MessageBubble({ role, content, initial }) {
  const isUser = role === 'user';
  return (
    <div className={`pt-msg-row ${isUser ? 'pt-msg-row--user' : ''}`}>
      {!isUser && <div className="pt-msg-avatar">{initial}</div>}
      <div
        className={`pt-msg-bubble pt-msg-bubble--${isUser ? 'user' : 'assistant'} pt-md`}
        dangerouslySetInnerHTML={{
          __html: isUser ? escapeHtml(content).replace(/\n/g, '<br/>') : renderMarkdown(content),
        }}
      />
    </div>
  );
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function TypingIndicator() {
  return (
    <div className="pt-msg-row">
      <div className="pt-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: '📦', label: 'Get a moving quote', message: 'I need a quote for a move.' },
  { icon: '📅', label: 'Book a move', message: 'I want to schedule a move.' },
  { icon: '📍', label: 'Service areas & pricing', message: 'What areas do you serve and how is pricing calculated?' },
];

export default function Widget({ api, onClose, isOpen, mode = 'float' }) {
  const isCenter = mode === 'center';
  const [view, setView] = React.useState('welcome');
  const [config, setConfig] = React.useState({
    businessName: 'Precise Timing Transports',
    welcomeMessage: 'Hi! How can we help with your move or delivery today?',
  });
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState(null);
  const [lastMeta, setLastMeta] = React.useState(null);
  const messagesEndRef = React.useRef(null);
  const visitorIdRef = React.useRef(null);

  const initial = (config.businessName || 'P').charAt(0).toUpperCase();

  React.useEffect(() => {
    visitorIdRef.current = api.visitorId;
    const stored = api.getConversationId();
    if (stored) setConversationId(stored);

    api.getWelcome().then(setConfig).catch(() => {});
  }, [api]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setView('chat');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.sendMessage({
        message: trimmed,
        conversationId,
        visitorId: visitorIdRef.current,
      });

      if (result.conversationId) {
        setConversationId(result.conversationId);
        api.setConversationId(result.conversationId);
      }

      setLastMeta({
        lead: result.lead,
        quote: result.quote,
        intent: result.intent,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    setView('chat');
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: config.welcomeMessage,
        },
      ]);
    }
  };

  if (!isOpen && !isCenter) return null;

  return (
    <div className={`pt-panel ${isCenter ? 'pt-panel--center' : ''}`}>
      <header className="pt-header">
        <div className="pt-header-left">
          <div className="pt-avatar-sm">
            {initial}
            <span className="pt-online-dot" />
          </div>
          <div>
            <p className="pt-brand-name">{config.businessName}</p>
            <p className="pt-brand-sub">Assistant · Online</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pt-header-tag">24/7</span>
          {!isCenter && onClose && (
            <button type="button" className="pt-close" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {view === 'welcome' ? (
        <div className="pt-welcome">
          <div className="pt-avatar-lg">{initial}</div>
          <h2 className="pt-welcome-title">Welcome to {config.businessName}</h2>
          <p className="pt-welcome-text">{config.welcomeMessage}</p>
          <button type="button" className="pt-cta" onClick={startChat}>
            <SparkleIcon />
            Start conversation
          </button>
          <p className="pt-footer-note">Available 24/7 · Moving & delivery</p>
        </div>
      ) : (
        <>
          <div className="pt-messages">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} initial={initial} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !loading && (
            <div className="pt-quick-actions">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="pt-quick-btn"
                  onClick={() => send(action.message)}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <div className="pt-input-area">
            <form
              className="pt-input-wrap"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className="pt-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="pt-send" disabled={loading || !input.trim()}>
                <SendIcon />
              </button>
            </form>
            <p className="pt-powered">
              Powered by {config.businessName} · AI assistant available 24/7
            </p>
            {lastMeta?.lead && (
              <p className="pt-meta-badge">✓ Lead saved — we&apos;ll follow up soon</p>
            )}
            {lastMeta?.quote && (
              <p className="pt-meta-badge">
                ✓ Quote #{lastMeta.quote.quoteNumber} · ${lastMeta.quote.amount}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { ChatIcon };
