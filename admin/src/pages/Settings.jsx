import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye, Palette, Save, MessageCircle, Globe } from 'lucide-react';
import { api } from '../api.js';

const DEFAULTS = {
  websitePrimary: '#12518d',
  websiteDeep: '#082138',
  websiteGold: '#c9a227',
  chatbotPrimary: '#111111',
  heroEyebrow: 'Reliable. Gentle. On time.',
  heroTitle: 'Small Moves. Delivery. Junk removal. Done Right.',
  heroLead:
    'Reliable moving, junk removal, furniture & delivery serving Cincinnati and surrounding areas.',
  ctaLabel: 'Request a Quote',
  chatbotWelcome: 'Hi! How can we help with your move or delivery today?',
};

export default function Settings() {
  const [row, setRow] = useState(null);
  const [form, setForm] = useState({
    business_name: 'Precise Timing Transports',
    business_phone: '',
    business_email: '',
    website_url: '',
    chatbot_welcome_message: DEFAULTS.chatbotWelcome,
    ...DEFAULTS,
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('website');

  useEffect(() => {
    api
      .settings()
      .then((data) => {
        setRow(data);
        const a = data.appearance_json || {};
        setForm({
          business_name: data.business_name || 'Precise Timing Transports',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          website_url: data.website_url || '',
          chatbot_welcome_message:
            data.chatbot_welcome_message || a.chatbotWelcome || DEFAULTS.chatbotWelcome,
          websitePrimary: a.websitePrimary || DEFAULTS.websitePrimary,
          websiteDeep: a.websiteDeep || DEFAULTS.websiteDeep,
          websiteGold: a.websiteGold || DEFAULTS.websiteGold,
          chatbotPrimary: a.chatbotPrimary || DEFAULTS.chatbotPrimary,
          heroEyebrow: a.heroEyebrow || DEFAULTS.heroEyebrow,
          heroTitle: a.heroTitle || DEFAULTS.heroTitle,
          heroLead: a.heroLead || DEFAULTS.heroLead,
          ctaLabel: a.ctaLabel || DEFAULTS.ctaLabel,
          chatbotWelcome: a.chatbotWelcome || data.chatbot_welcome_message || DEFAULTS.chatbotWelcome,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const previewUrl = useMemo(() => {
    if (form.website_url) return form.website_url;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:5173';
    }
    return 'https://precisetimingtransports.com/';
  }, [form.website_url]);

  const save = async () => {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const updated = await api.saveSettings({
        business_name: form.business_name,
        business_phone: form.business_phone || null,
        business_email: form.business_email || null,
        website_url: form.website_url || null,
        chatbot_welcome_message: form.chatbot_welcome_message || form.chatbotWelcome,
        appearance_json: {
          websitePrimary: form.websitePrimary,
          websiteDeep: form.websiteDeep,
          websiteGold: form.websiteGold,
          chatbotPrimary: form.chatbotPrimary,
          heroEyebrow: form.heroEyebrow,
          heroTitle: form.heroTitle,
          heroLead: form.heroLead,
          ctaLabel: form.ctaLabel,
          chatbotWelcome: form.chatbotWelcome || form.chatbot_welcome_message,
        },
      });
      setRow(updated);
      setSaved('Saved. Website and chatbot will pick this up on the next page load.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">Appearance</p>
          <h1>Settings</h1>
          <p className="muted">Colors, copy, and live previews for the website and chatbot.</p>
        </div>
        <div className="page__actions">
          <a className="btn btn--ghost" href={previewUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Preview website
          </a>
          <button type="button" className="btn btn--primary" onClick={save} disabled={busy}>
            <Save size={16} /> {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}
      {saved ? <p className="alert alert--ok">{saved}</p> : null}

      <div className="filters">
        <button type="button" className={`chip ${tab === 'website' ? 'is-on' : ''}`} onClick={() => setTab('website')}>
          <Globe size={14} /> Website
        </button>
        <button type="button" className={`chip ${tab === 'chatbot' ? 'is-on' : ''}`} onClick={() => setTab('chatbot')}>
          <MessageCircle size={14} /> Chatbot
        </button>
        <button type="button" className={`chip ${tab === 'business' ? 'is-on' : ''}`} onClick={() => setTab('business')}>
          <Palette size={14} /> Business
        </button>
      </div>

      <div className="split">
        <section className="panel">
          {tab === 'website' ? (
            <div className="edit-grid">
              <label>
                Primary color
                <span className="color-field">
                  <input type="color" value={form.websitePrimary} onChange={set('websitePrimary')} />
                  <input value={form.websitePrimary} onChange={set('websitePrimary')} />
                </span>
              </label>
              <label>
                Deep navy
                <span className="color-field">
                  <input type="color" value={form.websiteDeep} onChange={set('websiteDeep')} />
                  <input value={form.websiteDeep} onChange={set('websiteDeep')} />
                </span>
              </label>
              <label>
                Gold accent
                <span className="color-field">
                  <input type="color" value={form.websiteGold} onChange={set('websiteGold')} />
                  <input value={form.websiteGold} onChange={set('websiteGold')} />
                </span>
              </label>
              <label className="span-2">
                Hero eyebrow
                <input value={form.heroEyebrow} onChange={set('heroEyebrow')} />
              </label>
              <label className="span-2">
                Hero title
                <input value={form.heroTitle} onChange={set('heroTitle')} />
              </label>
              <label className="span-2">
                Hero description
                <textarea rows={3} value={form.heroLead} onChange={set('heroLead')} />
              </label>
              <label className="span-2">
                Primary button text
                <input value={form.ctaLabel} onChange={set('ctaLabel')} />
              </label>
            </div>
          ) : null}

          {tab === 'chatbot' ? (
            <div className="edit-grid">
              <label>
                Chatbot color
                <span className="color-field">
                  <input type="color" value={form.chatbotPrimary} onChange={set('chatbotPrimary')} />
                  <input value={form.chatbotPrimary} onChange={set('chatbotPrimary')} />
                </span>
              </label>
              <label className="span-2">
                Welcome message
                <textarea
                  rows={4}
                  value={form.chatbotWelcome}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      chatbotWelcome: e.target.value,
                      chatbot_welcome_message: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          {tab === 'business' ? (
            <div className="edit-grid">
              <label className="span-2">
                Business name
                <input value={form.business_name} onChange={set('business_name')} />
              </label>
              <label>
                Phone
                <input value={form.business_phone} onChange={set('business_phone')} />
              </label>
              <label>
                Email
                <input value={form.business_email} onChange={set('business_email')} />
              </label>
              <label className="span-2">
                Live website URL
                <input value={form.website_url} onChange={set('website_url')} placeholder="https://" />
              </label>
            </div>
          ) : null}
        </section>

        <section className="panel preview-panel">
          <div className="panel__head">
            <h2>
              <Eye size={16} /> Live preview
            </h2>
          </div>
          {tab !== 'chatbot' ? (
            <div
              className="site-preview"
              style={{
                '--preview-primary': form.websitePrimary,
                '--preview-deep': form.websiteDeep,
                '--preview-gold': form.websiteGold,
              }}
            >
              <div className="site-preview__bar">
                <strong>{form.business_name || 'Precise Timing'}</strong>
                <span>{form.ctaLabel}</span>
              </div>
              <div className="site-preview__hero">
                <small>{form.heroEyebrow}</small>
                <h3>{form.heroTitle}</h3>
                <p>{form.heroLead}</p>
                <em>{form.ctaLabel}</em>
              </div>
            </div>
          ) : (
            <div className="chat-preview" style={{ '--preview-accent': form.chatbotPrimary }}>
              <div className="chat-preview__head">
                <b>{(form.business_name || 'P').charAt(0)}</b>
                <div>
                  <strong>{form.business_name}</strong>
                  <span>Assistant · Online</span>
                </div>
              </div>
              <p>{form.chatbotWelcome}</p>
              <button type="button">Start conversation</button>
            </div>
          )}
        </section>
      </div>
      {row?.updated_at ? (
        <p className="muted" style={{ marginTop: '1rem' }}>
          Last saved {new Date(row.updated_at).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
