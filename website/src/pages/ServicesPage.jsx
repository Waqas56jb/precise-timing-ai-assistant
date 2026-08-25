import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import ContactSection from '../components/ContactSection';
import { IMAGES, SERVICES_PAGE } from '../data/site';
import {
  TruckIcon,
  MuscleIcon,
  TrashIcon,
  BoxIcon,
  BuildingIcon,
  ArrowRightIcon,
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

      <ContactSection
        id="contact"
        kicker={SERVICES_PAGE.contactTitle}
        title={SERVICES_PAGE.quoteCta}
        lead={SERVICES_PAGE.proof}
      />
    </>
  );
}
