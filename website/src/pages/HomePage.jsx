import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import ContactSection from '../components/ContactSection';
import { GALLERY, HOME, IMAGES, PHOTOS, PROMO, SITE } from '../data/site';
import { BLOG_POSTS } from '../data/blog';
import {
  CheckIcon,
  ShieldIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  BoxIcon,
  TrashIcon,
  BuildingIcon,
  ArrowRightIcon,
  StarIcon,
} from '../components/icons';

const SERVICE_CARDS = [
  {
    ...HOME.services.items[0],
    path: '/moving',
    image: PHOTOS.rampTruck,
    icon: <TruckIcon />,
  },
  {
    ...HOME.services.items[1],
    path: '/junk-removal',
    image: IMAGES.cleanout,
    icon: <TrashIcon />,
  },
  {
    ...HOME.services.items[2],
    path: '/delivery-services',
    image: PHOTOS.paddedVan,
    icon: <BoxIcon />,
  },
  {
    ...HOME.services.items[3],
    path: '/services',
    image: PHOTOS.wrappedTvs,
    icon: <BuildingIcon />,
  },
];

const AREAS = [
  'Cincinnati',
  'Northern Kentucky',
  'West Chester',
  'Mason',
  'Fairfield',
  'Blue Ash',
  'Sharonville',
  'Surrounding communities',
];

function Wave({ className }) {
  return (
    <svg className={className} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M0,64 C240,90 480,20 720,32 C960,44 1200,86 1440,54 L1440,90 L0,90 Z"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="home-hero" aria-label="Hero">
        <div className="home-hero__media">
          <img src={IMAGES.hero} alt="Professional movers carrying boxes during a small move" />
        </div>
        <div className="home-hero__veil" />

        <div className="home-hero__content">
          <span className="home-hero__badge">
            <StarIcon width={14} height={14} /> Moving · Delivery · Junk Removal — Cincinnati, OH
          </span>
          <h1>
            Small Moves. Delivery. Junk removal. <em>Done Right.</em>
          </h1>
          <p className="home-hero__lead">{HOME.heroLead}</p>
          <div className="home-hero__actions">
            <Link className="pt-btn pt-btn--primary pt-btn--lg" to="/#contact">
              {HOME.cta}
            </Link>
            <Link className="pt-btn pt-btn--ghost pt-btn--lg" to="/services">
              Explore Our Services
            </Link>
          </div>
          <div className="home-hero__trust">
            <span className="home-hero__trust-item">
              <ShieldIcon /> Fully insured
            </span>
            <span className="home-hero__trust-item">
              <ClockIcon /> On Time. Every Time.
            </span>
            <span className="home-hero__trust-item">
              <MapPinIcon /> Local Cincinnati service
            </span>
          </div>
        </div>

        <div className="home-hero__card">
          <strong>48 hours</strong>
          <span>We respond to every quote request within 48 hours — often much faster.</span>
        </div>

        <Wave className="home-hero__wave" />
      </section>

      {/* ============ STATS STRIP ============ */}
      <div className="pt-container stats-strip">
        <Reveal className="stats-strip__grid" variant="up">
          <div className="stats-strip__item">
            <ShieldIcon />
            <strong>Fully Insured</strong>
            <span>Your items are protected</span>
          </div>
          <div className="stats-strip__item">
            <ClockIcon />
            <strong>Same-Day Options</strong>
            <span>When available</span>
          </div>
          <div className="stats-strip__item">
            <TruckIcon />
            <strong>Small Moves Experts</strong>
            <span>Single items to full loads</span>
          </div>
          <div className="stats-strip__item">
            <MapPinIcon />
            <strong>Tri-State Coverage</strong>
            <span>Cincinnati &amp; beyond</span>
          </div>
        </Reveal>
      </div>

      {/* ============ DELIVERY IN ACTION ============ */}
      <section className="pt-section">
        <div className="pt-container home-split">
          <Reveal variant="left">
            <p className="pt-kicker">Watch us work</p>
            <h2>{HOME.deliveryInAction.title}</h2>
            <p className="pt-lead">{HOME.deliveryInAction.body}</p>
            <p style={{ marginTop: '1.25rem' }}>
              <a
                className="pt-btn pt-btn--ghost"
                href={SITE.social.youtube}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube <ArrowRightIcon width={16} height={16} />
              </a>
            </p>
          </Reveal>
          <Reveal variant="right" className="home-split__media">
            <img src={PHOTOS.studioMove} alt="Our van loaded for a same-day studio move in Cincinnati" />
            <span className="home-split__chip">
              <TruckIcon width={15} height={15} /> Real job — same-day studio move
            </span>
          </Reveal>
        </div>
      </section>

      {/* ============ WELCOME / OUR STORY ============ */}
      <section className="pt-section pt-section--tint">
        <div className="pt-container home-split home-split--rev">
          <Reveal variant="left" className="home-split__media home-split__media--accent-left">
            <img src={IMAGES.handshake} alt="Family-run business built on trust and clear communication" />
            <span className="home-split__chip">
              <StarIcon width={14} height={14} /> Family-run &amp; local
            </span>
          </Reveal>
          <Reveal variant="right">
            <p className="pt-kicker">{HOME.welcomeTitle}</p>
            <h2>{HOME.ourStory.headline}</h2>
            {HOME.ourStory.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className={p.length < 90 ? 'pt-lead' : undefined}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="pt-section">
        <div className="pt-container">
          <Reveal className="pt-center">
            <p className="pt-kicker">{HOME.services.title}</p>
            <h2>{HOME.services.intro}</h2>
          </Reveal>
          <div className="svc-grid">
            {SERVICE_CARDS.map((s, i) => (
              <Reveal key={s.name} delay={i * 90} variant="up" as="div">
                <Link to={s.path} className="svc-card">
                  <div className="svc-card__media">
                    <img src={s.image} alt={`${s.name} — ${s.text}`} loading="lazy" />
                    <span className="svc-card__icon">{s.icon}</span>
                  </div>
                  <div className="svc-card__body">
                    <h3>
                      {s.emoji} {s.name}
                    </h3>
                    <p>{s.text}</p>
                    <span className="svc-card__more">
                      Learn more <ArrowRightIcon width={15} height={15} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="pt-center" style={{ marginTop: '2rem' }}>
            <p className="pt-lead">{HOME.services.closing}</p>
          </Reveal>
        </div>
      </section>

      {/* ============ WHY / ON TIME EVERY TIME ============ */}
      <section className="pt-section pt-section--tint">
        <div className="pt-container home-split">
          <Reveal variant="left">
            <p className="pt-kicker">{HOME.ourStory.whyTitle}</p>
            <h2>{HOME.onTime.title}</h2>
            <ul className="feature-list">
              {HOME.onTime.bullets.map((b) => (
                <li key={b}>
                  <span className="fl-ic">
                    <CheckIcon />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal variant="right">
            <p className="pt-kicker">Service area</p>
            <h2>{SITE.serviceAreaTitle}</h2>
            <p className="pt-lead">
              From quote to completion, we get the job done right — across the entire Tri-State.
            </p>
            <div className="area-chips">
              {AREAS.map((a) => (
                <span key={a} className="area-chip">
                  <MapPinIcon width={14} height={14} /> {a}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TEAM ============ */}
      <section className="pt-section">
        <div className="pt-container home-split">
          <Reveal variant="left" className="home-split__media">
            <img src={PHOTOS.crew} alt="Our experienced and dedicated moving team unloading a truck" />
            <span className="home-split__chip">
              <CheckIcon width={14} height={14} /> Our real crew, on the job
            </span>
          </Reveal>
          <Reveal variant="right">
            <p className="pt-kicker">{HOME.team.title}</p>
            <h2>Real people. Real service.</h2>
            <p className="pt-lead">{HOME.team.body}</p>
          </Reveal>
        </div>
      </section>

      {/* ============ BOOKING PROCESS ============ */}
      <section className="pt-section pt-section--deep">
        <div className="pt-container">
          <Reveal className="pt-center">
            <p className="pt-kicker">{HOME.bookingProcess.title}</p>
            <h2>{HOME.bookingProcess.heading}</h2>
          </Reveal>
          <div className="process">
            {HOME.bookingProcess.steps.map((step, i) => {
              const clean = step.replace(/^\d+\.\s*/, '');
              const [title, ...rest] = clean.split(' – ');
              return (
                <Reveal key={step} delay={i * 100} className="process__item" variant="up">
                  <span className="process__num">{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{rest.join(' – ')}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ GALLERY — 100% real company photos ============ */}
      <section className="pt-section">
        <div className="pt-container">
          <Reveal className="pt-center">
            <p className="pt-kicker">Our work</p>
            <h2>{HOME.galleryTitle}</h2>
            <p className="pt-lead">
              No stock photos here — every shot below is straight from our crew&rsquo;s camera on
              real Cincinnati jobs.
            </p>
          </Reveal>
          <div className="real-gallery">
            {GALLERY.map((photo, i) => (
              <Reveal
                as="figure"
                key={photo.src}
                variant="up"
                delay={(i % 4) * 80}
                className={`real-gallery__tile${photo.featured ? ' real-gallery__tile--featured' : ''}`}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" />
                <span className="real-gallery__tag">{photo.tag}</span>
                <figcaption>{photo.caption}</figcaption>
              </Reveal>
            ))}
            <Reveal as="figure" variant="up" delay={160} className="real-gallery__tile real-gallery__tile--brand">
              <img src={PHOTOS.brandCard} alt="Precise Timing Transports brand emblem" loading="lazy" />
              <figcaption>Precise Timing Transports — Cincinnati, OH</figcaption>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ PRICE TEASER ============ */}
      <section className="pt-section pt-section--tint">
        <div className="pt-container">
          <Reveal className="pt-center">
            <p className="pt-kicker">Straightforward pricing</p>
            <h2>Popular starting rates</h2>
            <p className="pt-lead">
              Our pricing is based on distance, volume, urgency, and frequency. See the full price
              list for every service and add-on.
            </p>
          </Reveal>
          <div className="price-teaser">
            <Reveal className="price-teaser__card" variant="up">
              <h3>Junk Removal</h3>
              <div className="price-teaser__price">
                $99 <small>starting</small>
              </div>
              <p>Single item pickup — small items like a night stand or table.</p>
            </Reveal>
            <Reveal className="price-teaser__card" variant="up" delay={100}>
              <h3>Labor Only</h3>
              <div className="price-teaser__price">
                $120 <small>/hourly</small>
              </div>
              <p>2 guys providing labor. Each additional guy is an extra $40 per hour.</p>
            </Reveal>
            <Reveal className="price-teaser__card" variant="up" delay={200}>
              <h3>Full Service Moving</h3>
              <div className="price-teaser__price">
                $140 <small>/hourly</small>
              </div>
              <p>Two professional movers, moving truck, dollies, stretch wrap &amp; tools.</p>
            </Reveal>
          </div>
          <Reveal className="pt-center" style={{ marginTop: '2rem' }}>
            <Link className="pt-btn pt-btn--primary" to="/price-list">
              View full price list <ArrowRightIcon width={16} height={16} />
            </Link>
          </Reveal>

          {/* Senior discount promo */}
          <Reveal className="promo-band" variant="zoom">
            <div className="promo-band__media">
              <img src={PROMO.image} alt="Precise Timing Transports offer — 10% off for seniors" loading="lazy" />
            </div>
            <div className="promo-band__body">
              <span className="promo-band__chip">
                <StarIcon width={14} height={14} /> Current offer
              </span>
              <h3>{PROMO.title}</h3>
              <p>{PROMO.body}</p>
              <div className="promo-band__actions">
                <Link className="pt-btn pt-btn--primary" to="/#contact">
                  {PROMO.cta} <ArrowRightIcon width={16} height={16} />
                </Link>
                <a className="promo-band__phone" href={SITE.phoneHref}>
                  {SITE.phoneDisplay} · {SITE.phoneLabel}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="pt-section" style={{ paddingBottom: 0 }}>
        <div className="pt-container">
          <Reveal
            className="cta-band"
            variant="zoom"
            style={{ '--cta-image': `url(${IMAGES.truck})` }}
          >
            <div>
              <h2>{HOME.bestLine}</h2>
              <p>{HOME.contactIntro}</p>
            </div>
            <Link className="pt-btn pt-btn--light pt-btn--lg" to="/#contact">
              {HOME.cta}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <ContactSection id="contact" title="Let’s get you moved" lead={HOME.contactIntro} />

      {/* ============ BLOG ============ */}
      <section className="pt-section pt-section--tint">
        <div className="pt-container">
          <Reveal className="pt-center">
            <p className="pt-kicker">{HOME.blogTitle}</p>
            <h2>Tips from our crew</h2>
            <p className="pt-lead">
              Practical advice on moving, delivery, and junk removal — written by the people who do
              it every day.
            </p>
          </Reveal>
          <div className="blog-grid blog-grid--three">
            {BLOG_POSTS.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 90} variant="up">
                <Link to={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card__media">
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <span className="blog-card__tag">{post.tag}</span>
                  </div>
                  <div className="blog-card__body">
                    <p className="blog-card__meta">
                      {post.date} · {post.readTime}
                    </p>
                    <h3>{post.title}</h3>
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                    <span className="svc-card__more">
                      Read article <ArrowRightIcon width={15} height={15} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="pt-center" style={{ marginTop: '2rem' }}>
            <Link className="pt-btn pt-btn--ghost" to="/blog">
              View all articles <ArrowRightIcon width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
