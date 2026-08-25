import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { DELIVERY_PAGE, IMAGES, SITE } from '../data/site';
import { CheckIcon, PhoneIcon, MailIcon, ArrowRightIcon } from '../components/icons';

export default function DeliveryPage() {
  return (
    <>
      <PageHero
        title={DELIVERY_PAGE.title}
        lead={DELIVERY_PAGE.headline}
        image={IMAGES.parcels}
        crumb="Delivery Services"
      />
      <section className="pt-section">
        <div className="pt-container svc-layout">
          <Reveal className="svc-content" variant="up">
            <p className="pt-kicker">{DELIVERY_PAGE.tagline}</p>
            <h2>{DELIVERY_PAGE.headline}</h2>
            {DELIVERY_PAGE.intro.map((p) => (
              <p key={p.slice(0, 40)} className="pt-lead">
                {p}
              </p>
            ))}

            <img src={IMAGES.sofa} alt="Furniture delivered and set in place at home" loading="lazy" />

            <h3>{DELIVERY_PAGE.includeTitle}</h3>
            <ul className="check-grid">
              {DELIVERY_PAGE.includes.map((i) => (
                <li key={i}>
                  <CheckIcon width={16} height={16} /> {i}
                </li>
              ))}
            </ul>

            <p>{DELIVERY_PAGE.body}</p>
            <p className="pt-lead">
              <strong>{DELIVERY_PAGE.tagline}</strong>
            </p>
          </Reveal>

          <div className="svc-aside">
            <Reveal className="price-card" variant="right">
              <p className="price-card__label">Get a quote</p>
              <p className="price-card__price">You buy it. We move it!</p>
              <p className="price-card__note">{DELIVERY_PAGE.quoteNote}</p>
              <Link className="pt-btn pt-btn--light" to="/#contact">
                Request a Quote <ArrowRightIcon width={16} height={16} />
              </Link>
            </Reveal>
            <Reveal className="aside-help" variant="right" delay={120}>
              <h3>Questions? Talk to us</h3>
              <a href={`tel:${SITE.phoneTel}`}>
                <PhoneIcon /> {SITE.phoneDisplay}
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
