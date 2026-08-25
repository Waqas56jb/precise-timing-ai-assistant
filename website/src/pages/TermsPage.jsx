import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMAGES, TERMS } from '../data/site';

export default function TermsPage() {
  return (
    <>
      <PageHero
        title={TERMS.title}
        lead={TERMS.pleaseRead}
        image={IMAGES.handshake}
        crumb="Terms and conditions"
      />
      <section className="pt-section">
        <div className="pt-container">
          <Reveal className="prose-card" style={{ marginInline: 'auto' }} variant="up">
            <p>{TERMS.intro}</p>
            <div className="prose-highlight">{TERMS.minimum}</div>
            <h2>{TERMS.sectionTitle}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{TERMS.body}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
