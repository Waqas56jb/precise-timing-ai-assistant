import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMAGES, LABOR_PAGE, SITE } from '../data/site';
import { CheckIcon, PhoneIcon, MailIcon, ArrowRightIcon } from '../components/icons';

export default function LaborPage() {
  return (
    <>
      <PageHero
        title={LABOR_PAGE.title}
        lead={LABOR_PAGE.headline}
        image={IMAGES.movers}
        crumb="Labor only moving"
      />
      <section className="pt-section">
        <div className="pt-container svc-layout">
          <Reveal className="svc-content" variant="up">
            <p className="pt-kicker">Muscle on demand</p>
            <h2>{LABOR_PAGE.headline}</h2>
            {LABOR_PAGE.intro.map((p) => (
              <p key={p.slice(0, 40)} className="pt-lead">
                {p}
              </p>
            ))}

            <h3>{LABOR_PAGE.helpTitle}</h3>
            <ul className="check-grid">
              {LABOR_PAGE.help.map((h) => (
                <li key={h}>
                  <CheckIcon width={16} height={16} /> {h}
                </li>
              ))}
            </ul>

            <img src={IMAGES.team} alt="Our labor crew ready to load and unload" loading="lazy" />

            <p className="pt-lead">{LABOR_PAGE.closing}</p>
          </Reveal>

          <div className="svc-aside">
            <Reveal className="price-card" variant="right">
              <p className="price-card__label">Pricing</p>
              <p className="price-card__price">{LABOR_PAGE.price}</p>
              <p className="price-card__note">{LABOR_PAGE.priceNote}</p>
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
