import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  Save,
  Ban,
  Trash2,
  Unlock,
  Phone,
  Mail,
  Copy,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../api.js';
import {
  CHANNELS,
  STATUSES,
  sourceMeta,
  formatDate,
  formatMoney,
  displayName,
  isBlocked,
  parseMeta,
} from '../source.js';

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  pickup_address: '',
  dropoff_address: '',
  move_date: '',
  move_size: '',
  notes: '',
  status: 'new',
};

const HIDDEN_META = new Set([
  'blocked',
  'ai_reply',
  'ai_reply_at',
  'ai_reply_fingerprint',
  'notify_fingerprint',
  'notified_at',
  'yelp_inbox_reply_fingerprint',
  'yelp_inbox_message_id',
  'email_reply_to',
  'email_from_address',
  'email_message_id',
  'yelp_inbox_error',
  'yelp_inbox_replied_at',
  'yelp_inbox_reply_to',
]);

function lastAssistantReply(lead) {
  const fromChat = [...(lead?.messages || [])]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content);
  return fromChat?.content || parseMeta(lead).ai_reply || '';
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () =>
    api
      .lead(id)
      .then((row) => {
        setLead(row);
        setForm({
          name: row.name || '',
          phone: row.phone || '',
          email: row.email || '',
          pickup_address: row.pickup_address || '',
          dropoff_address: row.dropoff_address || '',
          move_date: row.move_date || '',
          move_size: row.move_size || '',
          notes: row.notes || '',
          status: row.status || 'new',
        });
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    setLead(null);
    setError('');
    setCopied(false);
    load();
  }, [id]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async (extra = {}) => {
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateLead(id, { ...form, ...extra });
      setLead((prev) => ({
        ...prev,
        ...updated,
        messages: prev?.messages || [],
        quotes: prev?.quotes || [],
      }));
      setForm((prev) => ({
        ...prev,
        name: updated.name ?? prev.name,
        phone: updated.phone ?? prev.phone,
        email: updated.email ?? prev.email,
        pickup_address: updated.pickup_address ?? prev.pickup_address,
        dropoff_address: updated.dropoff_address ?? prev.dropoff_address,
        move_date: updated.move_date ?? prev.move_date,
        move_size: updated.move_size ?? prev.move_size,
        notes: updated.notes ?? prev.notes,
        status: updated.status ?? prev.status,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setStatus = (status) => save({ status });
  const toggleBlock = () => save({ blocked: !isBlocked(lead) });

  const generateReply = async () => {
    setGenerating(true);
    setError('');
    try {
      const updated = await api.generateAiReply(id, true);
      setLead(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyReply = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the reply. Select the text and copy it manually.');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this customer record? This cannot be undone.')) return;
    setSaving(true);
    try {
      await api.deleteLead(id);
      navigate('/leads');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (error && !lead) {
    return (
      <div className="page">
        <p className="alert alert--err">{error}</p>
        <Link to="/leads" className="back">
          <ArrowLeft size={16} /> Back to leads
        </Link>
      </div>
    );
  }
  if (!lead) return <p className="muted page">Loading lead…</p>;

  const meta = sourceMeta(lead.source);
  const Icon = meta.icon;
  const blocked = isBlocked(lead);
  const backTo = CHANNELS[meta.id] ? `/channels/${meta.id}` : '/leads';
  const phoneHref = lead.phone ? `sms:${String(lead.phone).replace(/[^\d+]/g, '')}` : '';
  const isYelp = meta.id === 'yelp';
  const draftReply = lastAssistantReply(lead);
  const extras = parseMeta(lead);
  const inboxSent = Boolean(extras.yelp_inbox_replied_at);
  const inboxError = extras.yelp_inbox_error;
  const extraKeys = Object.keys(extras).filter((k) => !HIDDEN_META.has(k));

  return (
    <div className="page">
      <Link to={backTo} className="back">
        <ArrowLeft size={16} /> Back to {meta.label}
      </Link>
      <header className="page__head">
        <div>
          <p className="kicker">{meta.label} lead</p>
          <h1>{displayName(lead)}</h1>
          <p className="muted">
            Captured {formatDate(lead.created_at)}
            {blocked ? ' · Blocked' : ''}
          </p>
        </div>
        <div className="page__actions">
          <span className={`badge tone-${meta.tone}`}>
            {Icon ? <Icon size={14} /> : null} {meta.label}
          </span>
          {phoneHref ? (
            <a className="btn btn--ghost" href={phoneHref}>
              <Phone size={16} /> Text
            </a>
          ) : null}
          {lead.email ? (
            <a className="btn btn--ghost" href={`mailto:${lead.email}`}>
              <Mail size={16} /> Email
            </a>
          ) : null}
          <button type="button" className="btn btn--ghost" onClick={toggleBlock} disabled={saving}>
            {blocked ? <Unlock size={16} /> : <Ban size={16} />}
            {blocked ? 'Unblock' : 'Block'}
          </button>
          <button type="button" className="btn btn--danger" onClick={remove} disabled={saving}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <div className="filters">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={saving}
            className={`chip ${lead.status === s.id ? 'is-on' : ''}`}
            onClick={() => setStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="split">
        <section className="panel">
          <div className="panel__head">
            <h2>Customer details</h2>
          </div>
          <form
            className="edit-grid"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <label>
              Name
              <input value={form.name} onChange={set('name')} placeholder="Customer name" />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
            </label>
            <label>
              Email
              <input value={form.email} onChange={set('email')} placeholder="name@email.com" />
            </label>
            <label>
              Move date
              <input value={form.move_date} onChange={set('move_date')} placeholder="Date" />
            </label>
            <label className="span-2">
              Pickup
              <input value={form.pickup_address} onChange={set('pickup_address')} />
            </label>
            <label className="span-2">
              Drop-off
              <input value={form.dropoff_address} onChange={set('dropoff_address')} />
            </label>
            <label className="span-2">
              Size / service
              <input value={form.move_size} onChange={set('move_size')} />
            </label>
            <label className="span-2">
              Notes
              <textarea rows={4} value={form.notes} onChange={set('notes')} />
            </label>
            <div className="span-2">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>
              <MessageCircle size={18} /> Conversation
            </h2>
            {isYelp ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={generateReply}
                disabled={generating}
              >
                {draftReply ? <RefreshCw size={14} /> : <Sparkles size={14} />}
                {generating ? 'Sending…' : draftReply ? 'Send again' : 'Send AI reply'}
              </button>
            ) : null}
          </div>

          {isYelp && draftReply ? (
            <div className="ai-reply">
              <p className="ai-reply__hint">
                {inboxSent
                  ? 'Sent to the Yelp inbox automatically. Check the envelope on biz.yelp.com.'
                  : inboxError
                    ? `Not sent to Yelp yet: ${inboxError}`
                    : 'Waiting to send this into the Yelp inbox on the next lead email.'}
              </p>
              <p>{draftReply}</p>
              <div className="ai-reply__actions">
                <button type="button" className="btn btn--primary btn--sm" onClick={() => copyReply(draftReply)}>
                  <Copy size={14} /> {copied ? 'Copied' : 'Copy reply'}
                </button>
              </div>
            </div>
          ) : null}

          {isYelp && !draftReply ? (
            <p className="muted">
              No AI reply yet. New Yelp leads get an automatic inbox reply. You can also send one here.
            </p>
          ) : null}

          {lead.messages?.length ? (
            <div className="transcript">
              {lead.messages
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .map((m) => (
                  <div key={m.id} className={`bubble bubble--${m.role}`}>
                    <span>{m.role === 'user' ? 'Customer' : 'Assistant'}</span>
                    {m.content}
                  </div>
                ))}
            </div>
          ) : !isYelp ? (
            <p className="muted">No chat transcript — this lead came from the form, Yelp, or Thumbtack.</p>
          ) : null}

          {lead.quotes?.length ? (
            <div className="quotes-mini">
              <h3>Quotes</h3>
              {lead.quotes.map((q) => (
                <p key={q.id}>
                  {q.quote_number} · {formatMoney(q.amount)} · {q.status}
                  {q.valid_until ? ` · valid ${formatDate(q.valid_until)}` : ''}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2>Full record</h2>
        <dl className="facts">
          <div>
            <dt>Record ID</dt>
            <dd>{lead.id}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{lead.source || '—'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{lead.status || '—'}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(lead.created_at)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(lead.updated_at)}</dd>
          </div>
          <div>
            <dt>Conversation</dt>
            <dd>{lead.conversation_id || '—'}</dd>
          </div>
          <div>
            <dt>Blocked</dt>
            <dd>{blocked ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
        {extraKeys.length ? (
          <div className="notes" style={{ marginTop: '1rem' }}>
            <h3>Source extras</h3>
            <pre>
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(parseMeta(lead)).filter(([k]) => extraKeys.includes(k))
                ),
                null,
                2
              )}
            </pre>
          </div>
        ) : null}
      </section>
    </div>
  );
}
