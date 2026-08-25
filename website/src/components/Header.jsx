import { NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IMAGES, SITE } from '../data/site';
import {
  PhoneIcon,
  MailIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  BoxIcon,
  TrashIcon,
  MuscleIcon,
  BuildingIcon,
  FacebookIcon,
  TikTokIcon,
  YelpIcon,
  YouTubeIcon,
} from './icons';

const SERVICE_LINKS = [
  { label: 'Services', path: '/services', icon: <BuildingIcon /> },
  { label: 'Moving', path: '/moving', icon: <TruckIcon /> },
  { label: 'Labor only moving', path: '/labor-only-moving', icon: <MuscleIcon /> },
  { label: 'Delivery Services', path: '/delivery-services', icon: <BoxIcon /> },
  { label: 'Junk removal', path: '/junk-removal', icon: <TrashIcon /> },
];

const POLICY_LINKS = [
  { label: 'Terms and conditions', path: '/terms-and-conditions' },
  { label: 'Cancellation policy', path: '/cancellation-policy' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div className="pt-topbar">
        <div className="pt-container pt-topbar__inner">
          <div className="pt-topbar__group">
            <a href={`tel:${SITE.phoneTel}`}>
              <PhoneIcon width={13} height={13} /> {SITE.phoneDisplay}
            </a>
            <a className="pt-topbar__item--email" href={`mailto:${SITE.email}`}>
              <MailIcon width={13} height={13} /> {SITE.email}
            </a>
            <span className="pt-topbar__item pt-topbar__item--hours">
              <ClockIcon width={13} height={13} /> Mon 8am–6pm · Tue–Fri 9am–5pm · Sat/Sun by appointment
            </span>
          </div>
          <div className="pt-topbar__group">
            <span className="pt-topbar__item pt-topbar__item--area">
              <MapPinIcon width={13} height={13} /> Serving Cincinnati &amp; the Tri-State
            </span>
            <div className="pt-topbar__social">
              <a href={SITE.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon width={13} height={13} />
              </a>
              <a href={SITE.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
                <TikTokIcon width={13} height={13} />
              </a>
              <a href={SITE.social.yelp} target="_blank" rel="noreferrer" aria-label="Yelp">
                <YelpIcon width={13} height={13} />
              </a>
              <a href={SITE.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <YouTubeIcon width={13} height={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <header className={`pt-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="pt-container pt-header__inner">
          <Link to="/" className="pt-brand" onClick={close}>
            <img
              src={IMAGES.logoMark}
              alt="Precise Timing Transports gold 'P' emblem"
            />
            <span className="pt-brand__text">
              <span className="pt-brand__name">{SITE.name}</span>
              <span className="pt-brand__sub">On Time. Every Time.</span>
            </span>
          </Link>

          <nav className="pt-nav" aria-label="Primary">
            <NavLink to="/" end className="pt-nav__link">
              Home
            </NavLink>

            <div className="pt-nav__drop">
              <button type="button" className="pt-nav__dropbtn" aria-haspopup="true">
                Services <span className="pt-nav__caret" />
              </button>
              <div className="pt-nav__menu">
                {SERVICE_LINKS.map((item) => (
                  <NavLink key={item.path} to={item.path}>
                    <span className="pt-nav__mi">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <NavLink to="/price-list" className="pt-nav__link">
              Price list
            </NavLink>
            <NavLink to="/blog" className="pt-nav__link">
              Blog
            </NavLink>
            <NavLink to="/f-a-q" className="pt-nav__link">
              F.A.Q.
            </NavLink>

            <div className="pt-nav__drop">
              <button type="button" className="pt-nav__dropbtn" aria-haspopup="true">
                Policies <span className="pt-nav__caret" />
              </button>
              <div className="pt-nav__menu">
                {POLICY_LINKS.map((item) => (
                  <NavLink key={item.path} to={item.path}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <Link className="pt-btn pt-btn--primary pt-nav__cta" to="/#contact">
              Request a Quote
            </Link>
          </nav>

          <button
            type="button"
            className={`pt-burger ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`pt-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="pt-drawer__scrim" onClick={close} />
        <div className="pt-drawer__panel" role="dialog" aria-label="Menu">
          <div className="pt-drawer__head">
            <Link to="/" className="pt-brand" onClick={close}>
              <img src={IMAGES.logoMark} alt="Precise Timing Transports logo" />
              <span className="pt-brand__text">
                <span className="pt-brand__name">{SITE.name}</span>
              </span>
            </Link>
            <button type="button" className="pt-drawer__close" onClick={close} aria-label="Close menu">
              ✕
            </button>
          </div>

          <nav aria-label="Mobile">
            <NavLink to="/" end onClick={close}>
              Home
            </NavLink>

            <p className="pt-drawer__label">Services</p>
            {SERVICE_LINKS.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={close}>
                <span className="pt-nav__mi">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            <p className="pt-drawer__label">Pricing &amp; help</p>
            <NavLink to="/price-list" onClick={close}>
              Price list
            </NavLink>
            <NavLink to="/blog" onClick={close}>
              Blog
            </NavLink>
            <NavLink to="/f-a-q" onClick={close}>
              F.A.Q.
            </NavLink>

            <p className="pt-drawer__label">Policies</p>
            {POLICY_LINKS.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={close}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link className="pt-btn pt-btn--primary pt-btn--lg pt-drawer__cta" to="/#contact" onClick={close}>
            Request a Quote
          </Link>

          <div className="pt-drawer__contact">
            <a href={`tel:${SITE.phoneTel}`}>
              <PhoneIcon width={15} height={15} /> {SITE.phoneDisplay}
            </a>
            <a href={`mailto:${SITE.email}`}>
              <MailIcon width={15} height={15} /> {SITE.email}
            </a>
            <span>
              <MapPinIcon width={15} height={15} /> {SITE.serviceAreaTitle}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
