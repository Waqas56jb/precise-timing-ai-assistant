import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { BLOG_POSTS } from '../data/blog';
import { IMAGES } from '../data/site';
import { ArrowRightIcon } from '../components/icons';

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Moving & Delivery Blog"
        lead="Practical tips from our crew — preparing for moves, junk removal pricing, delivery day advice, and more."
        image={IMAGES.hero}
        crumb="Blog"
      />
      <section className="pt-section">
        <div className="pt-container">
          <div className="blog-grid">
            {BLOG_POSTS.map((post, i) => (
              <Reveal key={post.slug} delay={Math.min(i * 80, 320)} variant="up">
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
        </div>
      </section>
    </>
  );
}
