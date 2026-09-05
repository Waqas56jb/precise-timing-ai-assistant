import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ensureAdminSession } from './api.js';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Quotes from './pages/Quotes.jsx';
import Inbox from './pages/Inbox.jsx';
import Settings from './pages/Settings.jsx';
import Customers from './pages/Customers.jsx';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ensureAdminSession()
      .catch((err) => setError(err.message || 'Could not open the dashboard'))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="boot">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="boot boot--err">{error}</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="channels/:source" element={<Leads />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="customers" element={<Customers />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
