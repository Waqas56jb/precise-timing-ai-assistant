import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api.js';
import { CHANNELS, SOURCES, STATUSES, sourceMeta, formatDate, displayName, isBlocked } from '../source.js';
import LeadActions from '../components/LeadActions.jsx';
import ClickRow from '../components/ClickRow.jsx';

export default function Leads() {
  const { source: routeSource } = useParams();
  const [params, setParams] = useSearchParams();
  const locked = CHANNELS[routeSource] ? routeSource : '';
  const source = locked || params.get('source') || '';
  const status = params.get('status') || '';
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const [data, setData] = useState({ leads: [], total: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const rows = Array.isArray(data?.leads) ? data.leads : [];
  const channel = CHANNELS[source];

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const load = () => {
    setLoading(true);
    api
      .leads({ source, status, q, limit: 80 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
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

  if (routeSource && !CHANNELS[routeSource]) {
    return <Navigate to="/leads" replace />;
  }

  const onBlock = async (lead, blocked) => {
    setBusyId(lead.id);
    try {
      await api.updateLead(lead.id, { blocked });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const onDelete = async (lead) => {
    if (!window.confirm(`Delete ${displayName(lead)}? This cannot be undone.`)) return;
    setBusyId(lead.id);
    try {
      await api.deleteLead(lead.id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">{channel?.kicker || 'Pipeline'}</p>
          <h1>{channel?.title || 'All leads'}</h1>
          <p className="muted">
            {data.total} records
            {channel ? ` · ${channel.blurb}` : ' · website, chatbot, Yelp, Thumbtack'}
          </p>
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

      {!locked ? (
        <div className="filters">
          <button
            type="button"
            className={`chip ${!source ? 'is-on' : ''}`}
            onClick={() => setFilter('source', '')}
          >
            All sources
          </button>
          {SOURCES.map((s) => (
            <Link key={s.id} to={`/channels/${s.id}`} className={`chip ${source === s.id ? 'is-on' : ''}`}>
              <s.icon size={14} /> {s.label}
            </Link>
          ))}
        </div>
      ) : null}

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              rows.map((lead) => {
                const meta = sourceMeta(lead.source);
                return (
                  <ClickRow
                    key={lead.id}
                    to={`/leads/${lead.id}`}
                    className={isBlocked(lead) ? 'is-blocked' : ''}
                  >
                    <td>
                      <Link to={`/leads/${lead.id}`} className="row-name">
                        {displayName(lead)}
                      </Link>
                      {isBlocked(lead) ? <div className="sub">Blocked</div> : null}
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
                    <td>
                      <LeadActions
                        lead={lead}
                        busy={busyId === lead.id}
                        onBlock={onBlock}
                        onDelete={onDelete}
                      />
                    </td>
                  </ClickRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
