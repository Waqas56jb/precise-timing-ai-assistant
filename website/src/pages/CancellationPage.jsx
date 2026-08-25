import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { CANCELLATION, IMAGES } from '../data/site';

export default function CancellationPage() {
  return (
    <>
      <PageHero
        title={CANCELLATION.title}
        lead={CANCELLATION.note1}
        image={IMAGES.van}
        crumb="Cancellation policy"
      />
      <section className="pt-section">
        <div className="pt-container">
          <Reveal className="prose-card" style={{ marginInline: 'auto' }} variant="up">
            <h2>{CANCELLATION.standardClauseTitle}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{CANCELLATION.standardClause}</p>
            <div className="prose-highlight">{CANCELLATION.note2}</div>
            {CANCELLATION.sections.map((s) => (
              <div key={s.title}>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
