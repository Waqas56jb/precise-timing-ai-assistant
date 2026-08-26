import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield } from 'lucide-react';
import { api } from '../api.js';
import { sourceMeta, formatDate, displayName, isBlocked } from '../source.js';
import LeadActions from '../components/LeadActions.jsx';
import ClickRow from '../components/ClickRow.jsx';

export default function Customers() {
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState({ leads: [], total: 0 });
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .leads({ q, limit: 100 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    api.adminUsers().then(setAdmins).catch(() => setAdmins([]));
  };

  useEffect(() => {
    load();
  }, [q]);

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

  const toggleAdmin = async (user) => {
    setBusyId(user.id);
    try {
      await api.updateAdminUser(user.id, { is_active: !user.is_active });
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
          <p className="kicker">Directory</p>
          <h1>Customers</h1>
          <p className="muted">Everyone who contacted you from the website, chatbot, Yelp, or Thumbtack.</p>
        </div>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(query.trim());
          }}
        >
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
          />
        </form>
      </header>

      {error ? <p className="alert alert--err">{error}</p> : null}

      <section className="panel" style={{ marginBottom: '1.2rem' }}>
        <div className="panel__head">
          <h2>
            <Shield size={16} /> Admin accounts
          </h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {admins.map((user) => (
                <tr key={user.id}>
                  <td className="row-name">{user.full_name || 'Admin'}</td>
                  <td>{user.email}</td>
                  <td className="sub">{user.role}</td>
                  <td>
                    <span className={`status ${user.is_active ? 'status--booked' : 'status--archived'}`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={busyId === user.id}
                      onClick={() => toggleAdmin(user)}
                    >
                      {user.is_active ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Source</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="empty">
                  Loading…
                </td>
              </tr>
            ) : (data.leads || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  No customers found.
                </td>
              </tr>
            ) : (
              (data.leads || []).map((lead) => {
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
                      <div>{lead.phone || '—'}</div>
                      <div className="sub">{lead.email || ''}</div>
                    </td>
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
