import { useEffect, useState } from 'react';
import { HOME } from '../data/site';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('pt_cookie_ok')) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <aside className="pt-cookie" role="dialog" aria-label="Cookie notice">
      <h4>{HOME.cookie.title}</h4>
      <p>{HOME.cookie.body}</p>
      <button
        type="button"
        className="pt-btn pt-btn--primary"
        onClick={() => {
          try {
            localStorage.setItem('pt_cookie_ok', '1');
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        {HOME.cookie.accept}
      </button>
    </aside>
  );
}
