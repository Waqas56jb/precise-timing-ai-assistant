import { Navigate, Route, Routes } from 'react-router-dom';
import { isLoggedIn } from './auth.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Quotes from './pages/Quotes.jsx';
import Inbox from './pages/Inbox.jsx';
import Settings from './pages/Settings.jsx';
import Customers from './pages/Customers.jsx';

function Guard({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
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
