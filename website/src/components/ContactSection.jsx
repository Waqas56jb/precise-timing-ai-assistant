import Reveal from './Reveal';
import QuoteForm from './QuoteForm';
import { SITE } from '../data/site';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  FacebookIcon,
  TikTokIcon,
  YelpIcon,
  YouTubeIcon,
} from './icons';

export default function ContactSection({ id, kicker = 'Contact Us', title, lead }) {
  return (
    <section className="pt-section pt-section--tint" id={id}>
      <div className="pt-container">
        <Reveal className="contact-shell" variant="up">
          <div className="contact-shell__info">
            <p className="pt-kicker">{kicker}</p>
            <h2>{title}</h2>
            <p className="contact-shell__lead">{lead}</p>

            <div className="contact-shell__rows">
              <a className="contact-shell__row" href={SITE.phoneHref}>
                <span className="contact-shell__ic">
                  <PhoneIcon />
                </span>
                <span>
                  <strong>Text us</strong>
                  {SITE.phoneDisplay} · {SITE.phoneLabel}
                </span>
              </a>

              <a className="contact-shell__row" href={`mailto:${SITE.email}`}>
                <span className="contact-shell__ic">
                  <MailIcon />
                </span>
                <span>
                  <strong>Email</strong>
                  {SITE.email}
                </span>
              </a>

              <div className="contact-shell__row">
                <span className="contact-shell__ic">
                  <MapPinIcon />
                </span>
                <span>
                  <strong>{SITE.serviceAreaTitle}</strong>
                  {SITE.serviceArea}
                </span>
              </div>

              <div className="contact-shell__row">
                <span className="contact-shell__ic">
                  <ClockIcon />
                </span>
                <span>
                  <strong>Hours</strong>
                  Mon 8:00 am – 6:00 pm · Tue–Fri 9:00 am – 5:00 pm
                  <br />
                  Sat &amp; Sun by appointment
                </span>
              </div>
            </div>

            <div className="contact-shell__foot">
              <div className="pt-social" aria-label="Social links">
                <a href={SITE.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href={SITE.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
                  <TikTokIcon />
                </a>
                <a href={SITE.social.yelp} target="_blank" rel="noreferrer" aria-label="Yelp">
                  <YelpIcon />
                </a>
                <a href={SITE.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                  <YouTubeIcon />
                </a>
              </div>
              <p className="contact-shell__creds">
                {SITE.dot} · {SITE.mc}
                <br />
                Fully insured
              </p>
            </div>
          </div>

          <QuoteForm flat />
        </Reveal>
      </div>
    </section>
  );
}
