import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatMoney } from '../source.js';
import ClickRow from '../components/ClickRow.jsx';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .quotes()
      .then((data) => setQuotes(Array.isArray(data) ? data : data.quotes || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="kicker">Estimates</p>
          <h1>Quotes</h1>
          <p className="muted">Generated from chatbot conversations and pricing rules.</p>
        </div>
      </header>
      {error ? <p className="alert alert--err">{error}</p> : null}
      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Lead</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  No quotes yet.
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <ClickRow key={q.id} to={q.lead_id ? `/leads/${q.lead_id}` : ''}>
                  <td className="row-name" data-label="Number">{q.quote_number || q.id.slice(0, 8)}</td>
                  <td data-label="Amount">{formatMoney(q.amount)}</td>
                  <td data-label="Status">
                    <span className={`status status--${q.status}`}>{q.status}</span>
                  </td>
                  <td data-label="Lead">
                    {q.lead_id ? <Link to={`/leads/${q.lead_id}`}>Open lead</Link> : '—'}
                  </td>
                  <td data-label="Created">{formatDate(q.created_at)}</td>
                </ClickRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
