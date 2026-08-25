import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="pt-shell">
      <Header />
      <main className="pt-main">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
