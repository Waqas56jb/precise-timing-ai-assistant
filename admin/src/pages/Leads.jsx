import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api.js';
import { SOURCES, STATUSES, sourceMeta, formatDate } from '../source.js';

export default function Leads() {
  const [params, setParams] = useSearchParams();
  const source = params.get('source') || '';
  const status = params.get('status') || '';
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const [data, setData] = useState({ leads: [], total: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .leads({ source, status, q, limit: 80 })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, status, q]);

  const onSearch = (e) => {
    e.preventDefault();
    setFilter('q', query.trim());
  };

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">Pipeline</p>
          <h1>Leads</h1>
          <p className="muted">{data.total} records · website, chatbot, Yelp, Thumbtack</p>
        </div>
        <form className="search" onSubmit={onSearch}>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
          />
        </form>
      </header>

      <div className="filters">
        <button
          type="button"
          className={`chip ${!source ? 'is-on' : ''}`}
          onClick={() => setFilter('source', '')}
        >
          All sources
        </button>
        {SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${source === s.id ? 'is-on' : ''}`}
            onClick={() => setFilter('source', s.id)}
          >
            <s.icon size={14} /> {s.label}
          </button>
        ))}
      </div>
      <div className="filters">
        <button
          type="button"
          className={`chip chip--ghost ${!status ? 'is-on' : ''}`}
          onClick={() => setFilter('status', '')}
        >
          Any status
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip chip--ghost ${status === s.id ? 'is-on' : ''}`}
            onClick={() => setFilter('status', s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Source</th>
              <th>Status</th>
              <th>Phone / Email</th>
              <th>Job</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="empty">
                  Loading…
                </td>
              </tr>
            ) : data.leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              data.leads.map((lead) => {
                const meta = sourceMeta(lead.source);
                return (
                  <tr key={lead.id}>
                    <td>
                      <Link to={`/leads/${lead.id}`} className="row-name">
                        {lead.name || 'Unknown visitor'}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge tone-${meta.tone}`}>
                        <meta.icon size={12} /> {meta.label}
                      </span>
                    </td>
                    <td>
                      <span className={`status status--${lead.status}`}>{lead.status}</span>
                    </td>
                    <td>
                      <div>{lead.phone || '—'}</div>
                      <div className="sub">{lead.email || ''}</div>
                    </td>
                    <td className="clip">{lead.move_size || lead.pickup_address || '—'}</td>
                    <td>{formatDate(lead.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
