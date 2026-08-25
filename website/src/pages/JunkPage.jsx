import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMAGES, JUNK_PAGE, SITE } from '../data/site';
import { CheckIcon, PhoneIcon, MailIcon, ArrowRightIcon } from '../components/icons';

export default function JunkPage() {
  return (
    <>
      <PageHero
        title={JUNK_PAGE.title}
        lead={JUNK_PAGE.headline}
        image={IMAGES.cleanout}
        crumb="Junk removal"
      />
      <section className="pt-section">
        <div className="pt-container svc-layout">
          <Reveal className="svc-content" variant="up">
            <p className="pt-kicker">Cleanouts made easy</p>
            <h2>{JUNK_PAGE.headline}</h2>
            {JUNK_PAGE.intro.map((p) => (
              <p key={p.slice(0, 40)} className="pt-lead">
                {p}
              </p>
            ))}

            <h3>{JUNK_PAGE.removeTitle}</h3>
            <ul className="check-grid">
              {JUNK_PAGE.remove.map((r) => (
                <li key={r}>
                  <CheckIcon width={16} height={16} /> {r}
                </li>
              ))}
            </ul>

            <h3>{JUNK_PAGE.howTitle}</h3>
            <ul className="check-grid" style={{ gridTemplateColumns: '1fr' }}>
              {JUNK_PAGE.how.map((step) => (
                <li key={step.step}>
                  <CheckIcon width={16} height={16} />
                  <span>
                    <strong>{step.step}</strong> — {step.text}
                  </span>
                </li>
              ))}
            </ul>

            <img src={IMAGES.truck} alt="Truck loaded for junk hauling and disposal" loading="lazy" />
          </Reveal>

          <div className="svc-aside">
            <Reveal className="price-card" variant="right">
              <p className="price-card__label">Pricing</p>
              <p className="price-card__price">{JUNK_PAGE.price}</p>
              <p className="price-card__note">{JUNK_PAGE.priceNote}</p>
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
