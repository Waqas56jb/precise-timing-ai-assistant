import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import QuoteForm from '../components/QuoteForm';
import { IMAGES, SERVICES_PAGE, SITE } from '../data/site';
import {
  TruckIcon,
  MuscleIcon,
  TrashIcon,
  BoxIcon,
  BuildingIcon,
  ArrowRightIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '../components/icons';

const ICONS = {
  Moving: <TruckIcon />,
  'Labor only': <MuscleIcon />,
  'Junk Removal': <TrashIcon />,
  'Furniture & Appliance Delivery': <BoxIcon />,
  'Commercial & Last-Mile Delivery': <BuildingIcon />,
};

function Tile({ item, delay }) {
  return (
    <Reveal variant="up" delay={delay}>
      <Link to={item.path} className="service-tile">
        <span className="st-ic">{ICONS[item.label] || <TruckIcon />}</span>
        <strong>
          {item.emoji} {item.label}
        </strong>
        <span className="st-go">
          <ArrowRightIcon />
        </span>
      </Link>
    </Reveal>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title={SERVICES_PAGE.title}
        lead={SERVICES_PAGE.proof}
        image={IMAGES.truck}
        crumb="Services"
      />

      <section className="pt-section">
        <div className="pt-container">
          <Reveal>
            <p className="pt-kicker">{SERVICES_PAGE.primaryTitle}</p>
            <h2>Our primary services</h2>
          </Reveal>
          <div className="service-tiles">
            {SERVICES_PAGE.primary.map((item, i) => (
              <Tile key={item.label} item={item} delay={i * 80} />
            ))}
          </div>

          <Reveal style={{ marginTop: '3rem' }}>
            <p className="pt-kicker">{SERVICES_PAGE.secondaryTitle}</p>
            <h2>For businesses</h2>
          </Reveal>
          <div className="service-tiles">
            {SERVICES_PAGE.secondary.map((item, i) => (
              <Tile key={item.label} item={item} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-section pt-section--tint" id="contact">
        <div className="pt-container home-quote-wrap">
          <Reveal variant="left">
            <p className="pt-kicker">{SERVICES_PAGE.contactTitle}</p>
            <h2>{SERVICES_PAGE.quoteCta}</h2>
            <p className="pt-lead">{SERVICES_PAGE.proof}</p>
            <div className="contact-info-card" style={{ marginTop: '1.5rem' }}>
              <div className="contact-info-card__row">
                <span className="ci-ic">
                  <PhoneIcon />
                </span>
                <div>
                  <strong>Call or text us</strong>
                  <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
                </div>
              </div>
              <div className="contact-info-card__row">
                <span className="ci-ic">
                  <MailIcon />
                </span>
                <div>
                  <strong>{SERVICES_PAGE.emailCta}</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </div>
              </div>
              <div className="contact-info-card__row">
                <span className="ci-ic">
                  <MapPinIcon />
                </span>
                <div>
                  <strong>{SITE.serviceAreaTitle}</strong>
                  <span className="ci-val">{SITE.serviceArea}</span>
                </div>
              </div>
              <div className="contact-info-card__row">
                <span className="ci-ic">
                  <ClockIcon />
                </span>
                <div>
                  <strong>Hours</strong>
                  <span className="ci-val">
                    Mon 8:00 am – 6:00 pm · Tue–Fri 9:00 am – 5:00 pm · Sat &amp; Sun by appointment
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal variant="right">
            <QuoteForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
