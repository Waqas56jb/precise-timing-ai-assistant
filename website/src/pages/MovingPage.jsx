import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMAGES, MOVING_PAGE, SITE } from '../data/site';
import { CheckIcon, PhoneIcon, MailIcon, ArrowRightIcon } from '../components/icons';

export default function MovingPage() {
  return (
    <>
      <PageHero
        title={MOVING_PAGE.title}
        lead={MOVING_PAGE.headline}
        image={IMAGES.movers}
        crumb="Moving"
      />
      <section className="pt-section">
        <div className="pt-container svc-layout">
          <Reveal className="svc-content" variant="up">
            <p className="pt-kicker">Small moves specialists</p>
            <h2>{MOVING_PAGE.headline}</h2>
            {MOVING_PAGE.intro.map((p) => (
              <p key={p.slice(0, 40)} className="pt-lead">
                {p}
              </p>
            ))}

            <img src={IMAGES.house} alt="Residential move at a family home" loading="lazy" />

            <h3>{MOVING_PAGE.offerTitle}</h3>
            <ul className="check-grid">
              {MOVING_PAGE.offers.map((o) => (
                <li key={o}>
                  <CheckIcon width={16} height={16} /> {o}
                </li>
              ))}
            </ul>

            <h3>{MOVING_PAGE.whyTitle}</h3>
            <p>{MOVING_PAGE.why}</p>
          </Reveal>

          <div className="svc-aside">
            <Reveal className="price-card" variant="right">
              <p className="price-card__label">Pricing</p>
              <p className="price-card__price">{MOVING_PAGE.price}</p>
              <p className="price-card__note">{MOVING_PAGE.priceNote}</p>
              <Link className="pt-btn pt-btn--light" to="/#contact">
                Request a Quote <ArrowRightIcon width={16} height={16} />
              </Link>
            </Reveal>
            <Reveal className="aside-help" variant="right" delay={120}>
              <h3>Questions? Talk to us</h3>
              <a href={SITE.phoneHref}>
                <PhoneIcon /> {SITE.phoneDisplay} · {SITE.phoneLabel}
              </a>
              <a href={`mailto:${SITE.email}`}>
                <MailIcon /> {SITE.email}
              </a>
              <a href="/price-list">
                <ArrowRightIcon /> View the full price list
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
