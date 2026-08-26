import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox as InboxIcon, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../api.js';

export default function Inbox() {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .inboxStatus()
      .then(setStatus)
      .catch((err) => setError(err.message));
  }, []);

  const poll = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await api.pollInbox();
      setResult(res);
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
          <p className="kicker">Gmail parser</p>
          <h1>Yelp &amp; Thumbtack inbox</h1>
          <p className="muted">
            Reads precisetimingtransports@gmail.com, detects Yelp / Thumbtack lead mail, saves the
            lead, and emails the team.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={poll} disabled={busy}>
          <RefreshCw size={16} /> {busy ? 'Syncing…' : 'Sync inbox now'}
        </button>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <section className="stat-grid">
        <article className="stat-card">
          <InboxIcon size={18} />
          <p>IMAP</p>
          <strong>{status?.configured ? 'Connected' : 'Not set'}</strong>
          <span>{status?.user || '—'}</span>
        </article>
        <article className="stat-card">
          <p>Host</p>
          <strong>{status?.host || 'imap.gmail.com'}</strong>
          <span>Mailbox {status?.enabled ? 'auto-polls locally' : 'manual / cron'}</span>
        </article>
      </section>

      {result ? (
        <section className="panel">
          <h2>
            <CheckCircle2 size={18} /> Last sync
          </h2>
          <p>
            Scanned {result.scanned} · new {result.ingested} · updated {result.updated} · skipped{' '}
            {result.skipped}
          </p>
          {result.errors?.length ? (
            <p className="alert alert--err">
              <AlertTriangle size={14} /> {result.errors.length} error(s)
            </p>
          ) : null}
          {result.leads?.length ? (
            <ul className="sync-list">
              {result.leads.map((l) => (
                <li key={l.id}>
                  {l.id ? (
                    <Link to={`/leads/${l.id}`}>
                      {l.source} · {l.name || 'Unnamed'} {l.created ? '(new)' : '(updated)'}
                    </Link>
                  ) : (
                    <>
                      {l.source} · {l.name || 'Unnamed'} {l.created ? '(new)' : '(updated)'}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No new Yelp or Thumbtack messages this pass.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
