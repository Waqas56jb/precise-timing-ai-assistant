import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  FileText,
  Users,
} from 'lucide-react';
import { api } from '../api.js';
import { SOURCES, sourceMeta, formatDate, displayName, fillDaily } from '../source.js';
import ClickRow from '../components/ClickRow.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, a, list] = await Promise.all([
        api.stats(),
        api.analytics(),
        api.leads({ limit: 8 }),
      ]);
      setStats(s);
      setAnalytics(a);
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

  const daily = useMemo(() => fillDaily(analytics?.daily || []), [analytics]);
  const maxBar = Math.max(1, ...daily.map((d) => d.count));
  const booked = analytics?.booked ?? stats?.byStatus?.booked ?? 0;
  const quotes = analytics?.quotes ?? 0;
  const conversion = stats?.total ? Math.round((booked / stats.total) * 100) : 0;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">Command center</p>
          <h1>Overview</h1>
          <p className="muted">Pipeline health across website, chatbot, Yelp, and Thumbtack.</p>
        </div>
        <div className="page__actions">
          <Link to="/inbox" className="btn btn--ghost">
            Sync inbox
          </Link>
          <button type="button" className="btn btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <section className="kpi-grid">
        <article className="stat-card stat-card--hero">
          <Users size={18} />
          <p>Total leads</p>
          <strong>{stats?.total ?? '—'}</strong>
          <span>{stats?.last7Days ?? 0} new in the last 7 days</span>
        </article>
        <article className="stat-card">
          <TrendingUp size={18} />
          <p>Conversion</p>
          <strong>{conversion}%</strong>
          <span>Booked vs all leads</span>
        </article>
        <article className="stat-card">
          <FileText size={18} />
          <p>Quotes</p>
          <strong>{quotes}</strong>
          <span>Estimates generated</span>
        </article>
        <article className="stat-card">
          <CalendarCheck size={18} />
          <p>Booked</p>
          <strong>{booked}</strong>
          <span>Jobs marked booked</span>
        </article>
      </section>

      <section className="stat-grid">
        {SOURCES.map((s) => (
          <Link key={s.id} to={`/channels/${s.id}`} className={`stat-card tone-${s.tone}`}>
            <s.icon size={18} />
            <p>{s.label}</p>
            <strong>{countFor(s.id)}</strong>
          </Link>
        ))}
      </section>

      <section className="panel chart-panel">
        <div className="panel__head">
          <h2>Leads · last 14 days</h2>
          <span className="muted">{daily.reduce((s, d) => s + d.count, 0)} captured</span>
        </div>
        <div className="chart" role="img" aria-label="Daily lead volume">
          {daily.map((d) => (
            <div key={d.day} className="chart__col" title={`${d.day}: ${d.count}`}>
              <div
                className="chart__bar"
                style={{ height: `${Math.max(6, (d.count / maxBar) * 100)}%` }}
              />
              <span>{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
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
                    <ClickRow key={lead.id} to={`/leads/${lead.id}`}>
                      <td data-label="Customer">
                        <Link to={`/leads/${lead.id}`} className="row-name">
                          {displayName(lead)}
                        </Link>
                        <div className="sub">{lead.move_size || lead.notes?.slice(0, 48) || '—'}</div>
                      </td>
                      <td data-label="Source">
                        <span className={`badge tone-${meta.tone}`}>
                          <meta.icon size={12} /> {meta.label}
                        </span>
                      </td>
                      <td data-label="Contact">{lead.phone || lead.email || '—'}</td>
                      <td data-label="When">{formatDate(lead.created_at)}</td>
                    </ClickRow>
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
