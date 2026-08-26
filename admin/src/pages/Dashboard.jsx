import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { api } from '../api.js';
import { SOURCES, sourceMeta, formatDate } from '../source.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, list] = await Promise.all([api.stats(), api.leads({ limit: 8 })]);
      setStats(s);
      setRecent(list.leads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const countFor = (id) => {
    if (!stats) return 0;
    if (id === 'chatbot') return stats.bySource?.chatbot || 0;
    return stats.bySource?.[id] || 0;
  };

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">Command center</p>
          <h1>Every lead. One inbox.</h1>
          <p className="muted">Website form, AI chat, Yelp, and Thumbtack — live from the database.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <section className="stat-grid">
        <article className="stat-card stat-card--hero">
          <p>Total leads</p>
          <strong>{stats?.total ?? '—'}</strong>
          <span>{stats?.last7Days ?? 0} new in the last 7 days</span>
        </article>
        {SOURCES.map((s) => (
          <Link key={s.id} to={`/leads?source=${s.id}`} className={`stat-card tone-${s.tone}`}>
            <s.icon size={18} />
            <p>{s.label}</p>
            <strong>{countFor(s.id)}</strong>
          </Link>
        ))}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Latest activity</h2>
          <Link to="/leads" className="text-link">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Contact</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="empty">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                recent.map((lead) => {
                  const meta = sourceMeta(lead.source);
                  return (
                    <tr key={lead.id}>
                      <td>
                        <Link to={`/leads/${lead.id}`} className="row-name">
                          {lead.name || 'Unknown visitor'}
                        </Link>
                        <div className="sub">{lead.move_size || lead.notes?.slice(0, 48) || '—'}</div>
                      </td>
                      <td>
                        <span className={`badge tone-${meta.tone}`}>
                          <meta.icon size={12} /> {meta.label}
                        </span>
                      </td>
                      <td>
                        {lead.phone || lead.email || '—'}
                      </td>
                      <td>{formatDate(lead.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
