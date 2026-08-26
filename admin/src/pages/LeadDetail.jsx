import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  StickyNote,
  MessageCircle,
} from 'lucide-react';
import { api } from '../api.js';
import { STATUSES, sourceMeta, formatDate, formatMoney } from '../source.js';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .lead(id)
      .then(setLead)
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, [id]);

  const setStatus = async (status) => {
    setSaving(true);
    try {
      const updated = await api.updateLead(id, status);
      setLead((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && !lead) return <p className="alert alert--err">{error}</p>;
  if (!lead) return <p className="muted page">Loading lead…</p>;

  const meta = sourceMeta(lead.source);
  const rows = [
    ['Phone', lead.phone, Phone],
    ['Email', lead.email, Mail],
    ['Pickup', lead.pickup_address, MapPin],
    ['Drop-off', lead.dropoff_address, MapPin],
    ['Move date', lead.move_date, Calendar],
    ['Size / service', lead.move_size, StickyNote],
  ];

  return (
    <div className="page">
      <Link to="/leads" className="back">
        <ArrowLeft size={16} /> All leads
      </Link>
      <header className="page__head">
        <div>
          <p className="kicker">{meta.label} lead</p>
          <h1>{lead.name || 'Unknown visitor'}</h1>
          <p className="muted">Captured {formatDate(lead.created_at)}</p>
        </div>
        <span className={`badge tone-${meta.tone}`}>
          <meta.icon size={14} /> {meta.label}
        </span>
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
          <h2>Customer details</h2>
          <dl className="facts">
            {rows.map(([label, value, Icon]) => (
              <div key={label}>
                <dt>
                  <Icon size={14} /> {label}
                </dt>
                <dd>
                  {label === 'Phone' && value ? (
                    <a href={`sms:${String(value).replace(/[^\d+]/g, '')}`}>{value}</a>
                  ) : label === 'Email' && value ? (
                    <a href={`mailto:${value}`}>{value}</a>
                  ) : (
                    value || '—'
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {lead.notes ? (
            <div className="notes">
              <h3>Notes</h3>
              <pre>{lead.notes}</pre>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h2>
            <MessageCircle size={18} /> Conversation
          </h2>
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
          ) : (
            <p className="muted">No chat transcript — this lead came from the form, Yelp, or Thumbtack.</p>
          )}

          {lead.quotes?.length ? (
            <div className="quotes-mini">
              <h3>Quotes</h3>
              {lead.quotes.map((q) => (
                <p key={q.id}>
                  {q.quote_number} · {formatMoney(q.amount)} · {q.status}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
