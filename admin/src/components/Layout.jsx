import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Inbox,
  LogOut,
  Truck,
} from 'lucide-react';
import { setSession, getAdminEmail } from '../auth.js';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/quotes', label: 'Quotes', icon: FileText },
  { to: '/inbox', label: 'Email inbox', icon: Inbox },
];

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => {
    setSession();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">
            <Truck size={22} />
          </span>
          <div>
            <strong>Precise Timing</strong>
            <span>Command center</span>
          </div>
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="navlink">
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="navlink navlink--out" onClick={logout}>
          <LogOut size={18} />
          <span>
            Sign out
            {getAdminEmail() ? <small className="navlink__sub">{getAdminEmail()}</small> : null}
          </span>
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
