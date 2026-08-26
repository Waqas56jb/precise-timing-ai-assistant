import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Inbox,
  LogOut,
  Truck,
  Globe,
  MessageCircle,
  Star,
  Pin,
  UserCog,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { setSession, getAdminEmail, getAdminName } from '../auth.js';
import ErrorBoundary from './ErrorBoundary.jsx';

const GROUPS = [
  {
    label: 'Pipeline',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/channels/website_form', label: 'Website', icon: Globe },
      { to: '/channels/chatbot', label: 'Chatbot', icon: MessageCircle },
      { to: '/channels/yelp', label: 'Yelp', icon: Star },
      { to: '/channels/thumbtack', label: 'Thumbtack', icon: Pin },
      { to: '/leads', label: 'All leads', icon: Users },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/customers', label: 'Customers', icon: UserCog },
      { to: '/quotes', label: 'Quotes', icon: FileText },
      { to: '/inbox', label: 'Email inbox', icon: Inbox },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = () => {
    setSession();
    navigate('/login');
  };

  return (
    <div className={`shell ${open ? 'shell--nav-open' : ''}`}>
      {open ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">
            <Truck size={22} />
          </span>
          <div>
            <strong>Precise Timing</strong>
            <span>Command center</span>
          </div>
          <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {GROUPS.map((group) => (
          <div key={group.label} className="nav-group">
            <p className="nav-group__label">{group.label}</p>
            <nav>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end === true}
                  className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        <button type="button" className="navlink navlink--out" onClick={logout}>
          <LogOut size={18} />
          <span>
            Sign out
            <small className="navlink__sub">{getAdminName() || getAdminEmail() || 'Admin'}</small>
          </span>
        </button>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button type="button" className="topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="topbar__brand">
            <Truck size={16} />
            Precise Timing
          </div>
          <NavLink to="/settings" className="topbar__settings" title="Settings">
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </header>
        <main className="main">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
