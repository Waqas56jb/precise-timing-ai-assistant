import { IMAGES } from '../data/site';

export default function PageHero({ title, lead, image = IMAGES.hero }) {
  return (
    <section
      className="pt-page-hero"
      style={{ '--pt-page-hero-image': `url(${image})` }}
    >
      <div className="pt-container">
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
    </section>
  );
}
