import { Link, Navigate, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { BLOG_POSTS, getPostBySlug } from '../data/blog';
import { ArrowRightIcon } from '../components/icons';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__media">
          <img src={post.image} alt="" aria-hidden="true" loading="eager" />
        </div>
        <div className="page-hero__veil" />
        <div className="pt-container page-hero__content">
          <p className="page-hero__crumb">
            <Link to="/">Home</Link> <span aria-hidden="true">›</span>{' '}
            <Link to="/blog">Blog</Link> <span aria-hidden="true">›</span> {post.tag}
          </p>
          <h1>{post.title}</h1>
          <p>
            {post.date} · {post.readTime}
          </p>
        </div>
      </section>

      <section className="pt-section">
        <div className="pt-container">
          <Reveal className="prose-card blog-post" style={{ marginInline: 'auto' }} variant="up">
            <p className="pt-lead">{post.excerpt}</p>
            {post.sections.map((section) => (
              <div key={section.heading}>
                <h2>{section.heading}</h2>
                {(section.paragraphs || []).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
                {section.list ? (
                  <ul className="blog-post__list">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <div className="blog-post__cta">
              <div>
                <strong>Ready to book?</strong>
                <p style={{ margin: 0 }}>Get a free quote — we respond within 48 hours.</p>
              </div>
              <Link className="pt-btn pt-btn--primary" to="/#contact">
                Request a Quote <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>
          </Reveal>

          <div className="blog-related">
            <Reveal>
              <h2 className="pt-center" style={{ marginTop: '3rem' }}>
                Keep reading
              </h2>
            </Reveal>
            <div className="blog-grid blog-grid--two">
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 100} variant="up">
                  <Link to={`/blog/${p.slug}`} className="blog-card">
                    <div className="blog-card__media">
                      <img src={p.image} alt={p.title} loading="lazy" />
                      <span className="blog-card__tag">{p.tag}</span>
                    </div>
                    <div className="blog-card__body">
                      <p className="blog-card__meta">
                        {p.date} · {p.readTime}
                      </p>
                      <h3>{p.title}</h3>
                      <span className="svc-card__more">
                        Read article <ArrowRightIcon width={15} height={15} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
