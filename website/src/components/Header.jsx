import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { IMAGES, NAV, SITE } from '../data/site';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pt-header">
      <div className="pt-container pt-header__inner">
        <Link to="/" className="pt-brand" onClick={() => setOpen(false)}>
          <img src={IMAGES.logo} alt="Elegant gold logo with letter P — Precise Timing Transports" />
          <span className="pt-brand__text">
            <span className="pt-brand__name">{SITE.name}</span>
            <span className="pt-brand__sub">Cincinnati · Tri-State</span>
          </span>
        </Link>

        <button
          type="button"
          className="pt-nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`pt-nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <a className="pt-btn pt-btn--primary pt-nav__cta" href="/#contact" onClick={() => setOpen(false)}>
            Request a Quote
          </a>
        </nav>
      </div>
    </header>
  );
}
