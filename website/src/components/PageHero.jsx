import { Link } from 'react-router-dom';
import { IMAGES } from '../data/site';

export default function PageHero({ title, lead, image = IMAGES.hero, crumb }) {
  return (
    <section className="page-hero">
      <div className="page-hero__media">
        <img src={image} alt="" aria-hidden="true" loading="eager" />
      </div>
      <div className="page-hero__veil" />
      <div className="pt-container page-hero__content">
        <p className="page-hero__crumb">
          <Link to="/">Home</Link> <span aria-hidden="true">›</span> {crumb || title}
        </p>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
    </section>
  );
}
