import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { FAQ, IMAGES } from '../data/site';
import { ArrowRightIcon } from '../components/icons';

export default function FaqPage() {
  return (
    <>
      <PageHero
        title={FAQ.title}
        lead={FAQ.intro}
        image={IMAGES.handshake}
        crumb="F.A.Q."
      />
      <section className="pt-section">
        <div className="pt-container">
          <div className="faq-list" style={{ marginInline: 'auto' }}>
            {FAQ.items.map((item, i) => (
              <Reveal key={item.q} delay={Math.min(i * 60, 300)} variant="up">
                <details className="faq-item">
                  <summary>{item.q}</summary>
                  <div className="faq-item__body">{item.a}</div>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal className="pt-center" style={{ marginTop: '3rem' }}>
            <p className="pt-lead">Still have a question? We’re happy to help.</p>
            <Link className="pt-btn pt-btn--primary" to="/#contact">
              Contact us <ArrowRightIcon width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
