import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import ChatWidget from './ChatWidget';
import { AppearanceProvider } from '../lib/appearance';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <AppearanceProvider>
      <div className="pt-shell">
        <Header />
        <main className="pt-main">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
        <ChatWidget />
      </div>
    </AppearanceProvider>
  );
}
