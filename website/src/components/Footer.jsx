import { Link } from 'react-router-dom';
import { IMAGES, SITE } from '../data/site';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  FacebookIcon,
  TikTokIcon,
  YelpIcon,
  YouTubeIcon,
} from './icons';

const SERVICE_LINKS = [
  { label: 'Services overview', path: '/services' },
  { label: 'Moving', path: '/moving' },
  { label: 'Labor only moving', path: '/labor-only-moving' },
  { label: 'Delivery Services', path: '/delivery-services' },
  { label: 'Junk removal', path: '/junk-removal' },
];

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Price list', path: '/price-list' },
  { label: 'F.A.Q.', path: '/f-a-q' },
  { label: 'Terms and conditions', path: '/terms-and-conditions' },
  { label: 'Cancellation policy', path: '/cancellation-policy' },
];

export default function Footer() {
  return (
    <footer className="pt-footer">
      <div className="pt-container">
        <div className="pt-footer__cta">
          <div>
            <h3>Looking for a hassle free delivery?</h3>
            <p>
              We offer competitive pricing based on distance, volume, urgency, and frequency.
              Request a quote today!
            </p>
          </div>
          <Link className="pt-btn pt-btn--light pt-btn--lg" to="/#contact">
            Request a Quote
          </Link>
        </div>

        <div className="pt-footer__grid">
          <div>
            <div className="pt-footer__brand">
              <img src={IMAGES.logo} alt="Precise Timing Transports logo" />
              <strong>{SITE.name}</strong>
            </div>
            <p>
              Reliable moving, junk removal, furniture &amp; delivery serving Cincinnati and
              surrounding areas. Built on Reliability. Driven by Precision.
            </p>
            <p>
              {SITE.serviceAreaTitle}
              <br />
              {SITE.serviceArea}
            </p>
            <div className="pt-social" aria-label="Social links">
              <a href={SITE.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href={SITE.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href={SITE.social.yelp} target="_blank" rel="noreferrer" aria-label="Yelp">
                <YelpIcon />
              </a>
              <a href={SITE.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <YouTubeIcon />
              </a>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul className="pt-footer__links">
              {SERVICE_LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul className="pt-footer__links">
              {QUICK_LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact &amp; Hours</h4>
            <div className="pt-footer__contact">
              <a href={`tel:${SITE.phoneTel}`}>
                <PhoneIcon /> {SITE.phoneDisplay}
              </a>
              <a href={`mailto:${SITE.email}`}>
                <MailIcon /> {SITE.email}
              </a>
              <span>
                <MapPinIcon /> Cincinnati, OH &amp; the Tri-State
              </span>
            </div>
            <table className="pt-footer__hours">
              <tbody>
                {SITE.hours.map((row) => (
                  <tr key={row.day}>
                    <td>{row.day}</td>
                    <td>{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-footer__bottom">
          <p style={{ margin: 0 }}>{SITE.copyright}</p>
          <div className="pt-footer__badges">
            <span className="pt-footer__badge">{SITE.dot}</span>
            <span className="pt-footer__badge">{SITE.mc}</span>
            <span className="pt-footer__badge">Fully Insured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
