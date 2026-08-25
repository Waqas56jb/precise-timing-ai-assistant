import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

export default function Footer() {
  return (
    <footer className="pt-footer">
      <div className="pt-container pt-footer__grid">
        <div>
          <h3>{SITE.name}</h3>
          <p>
            {SITE.serviceAreaTitle}
            <br />
            {SITE.serviceArea}
          </p>
          <p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <br />
            <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
          </p>
          <p>Request a quote today!</p>
          <div className="pt-social" aria-label="Social links">
            <a href={SITE.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              FB
            </a>
            <a href={SITE.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              TT
            </a>
            <a href={SITE.social.yelp} target="_blank" rel="noreferrer" aria-label="Yelp">
              YP
            </a>
            <a href={SITE.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>

        <div>
          <h3>Hours</h3>
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

        <div>
          <h3>Explore</h3>
          <p>
            <Link to="/services">Services</Link>
            <br />
            <Link to="/price-list">Price list</Link>
            <br />
            <Link to="/f-a-q">F.A.Q.</Link>
            <br />
            <Link to="/terms-and-conditions">Terms and conditions</Link>
            <br />
            <Link to="/cancellation-policy">Cancellation policy</Link>
          </p>
        </div>
      </div>

      <div className="pt-container pt-footer__bottom">
        <p>{SITE.copyright}</p>
      </div>
    </footer>
  );
}
