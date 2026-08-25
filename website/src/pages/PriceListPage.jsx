import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMAGES, PRICE_LIST } from '../data/site';
import { CheckIcon, ArrowRightIcon } from '../components/icons';

export default function PriceListPage() {
  const { lastMile, movingJunk, addons } = PRICE_LIST;

  return (
    <>
      <PageHero
        title={PRICE_LIST.title}
        lead={lastMile.intro}
        image={IMAGES.truck}
        crumb="Price list"
      />

      <section className="pt-section">
        <div className="pt-container">
          {/* Last mile delivery */}
          <Reveal>
            <p className="pt-kicker">{lastMile.title}</p>
            <h2>{lastMile.standardTitle}</h2>
            <p className="pt-lead">{lastMile.intro}</p>
          </Reveal>

          <Reveal className="rate-pills" variant="up">
            {lastMile.rates.map((rate) => {
              const [label, price] = rate.split(': ');
              return (
                <div className="rate-pill" key={rate}>
                  <span>{label}</span>
                  <strong>{price}</strong>
                </div>
              );
            })}
          </Reveal>
          <Reveal as="p" className="quote-form__note">
            {lastMile.ratesNote}
          </Reveal>

          <div className="price-section-head">
            <Reveal>
              <h2 style={{ margin: 0 }}>{lastMile.routesTitle}</h2>
            </Reveal>
          </div>
          <Reveal className="rate-pills" variant="up">
            <div className="rate-pill">
              <span>{lastMile.routesNote}</span>
              <strong>{lastMile.routesPrice}</strong>
            </div>
          </Reveal>

          <Reveal style={{ marginTop: '2.5rem' }}>
            <h3>{lastMile.affectsTitle}</h3>
            <ul className="check-grid" style={{ maxWidth: '46rem' }}>
              {lastMile.affects.map((a) => (
                <li key={a}>
                  <CheckIcon width={16} height={16} /> {a}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Moving / junk removal */}
          <div className="price-section-head">
            <Reveal>
              <p className="pt-kicker">Rates</p>
              <h2 style={{ margin: 0 }}>{movingJunk.title}</h2>
            </Reveal>
          </div>
          <div className="price-grid">
            {movingJunk.items.map((item, i) => (
              <Reveal className="price-item" key={item.name} delay={Math.min(i * 60, 300)} variant="up">
                <h3>{item.name}</h3>
                <div className="price-item__price">{item.price}</div>
                {item.detail ? <p>{item.detail}</p> : null}
              </Reveal>
            ))}
          </div>

          {/* Add-ons */}
          <div className="price-section-head">
            <Reveal>
              <p className="pt-kicker">Extras</p>
              <h2 style={{ margin: 0 }}>{addons.title}</h2>
            </Reveal>
          </div>
          <div className="price-grid">
            {addons.items.map((item, i) => (
              <Reveal className="price-item" key={item.name} delay={Math.min(i * 60, 300)} variant="up">
                <h3>{item.name}</h3>
                <div className="price-item__price">{item.price}</div>
                {item.detail ? <p>{item.detail}</p> : null}
              </Reveal>
            ))}
          </div>

          <Reveal className="pt-center" style={{ marginTop: '3.5rem' }}>
            <p className="pt-lead">Ready for an exact number for your job?</p>
            <Link className="pt-btn pt-btn--primary pt-btn--lg" to="/#contact">
              Request a FREE Quote <ArrowRightIcon width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
