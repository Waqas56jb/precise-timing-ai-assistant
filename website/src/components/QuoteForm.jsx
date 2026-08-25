import { useState } from 'react';
import { QUOTE_FIELDS, SITE } from '../data/site';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  CalendarIcon,
  StairsIcon,
  PaperclipIcon,
  SendIcon,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
} from './icons';

const FULL_WIDTH = new Set(['pickup', 'dropoff', 'service']);

const FIELD_ICONS = {
  name: <UserIcon />,
  service: <TruckIcon />,
  email: <MailIcon />,
  phone: <PhoneIcon />,
  pickup: <MapPinIcon />,
  dropoff: <MapPinIcon />,
  stairs: <StairsIcon />,
  date: <CalendarIcon />,
};

/* UX upgrades that keep the original labels intact */
const TYPE_OVERRIDES = { date: 'date', stairs: 'number' };

const SERVICE_CHIPS = ['Moving', 'Labor only', 'Delivery', 'Junk removal'];

export default function QuoteForm({ flat = false }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries([...QUOTE_FIELDS.map((f) => [f.name, '']), ['details', '']])
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setService = (value) => setForm((prev) => ({ ...prev, service: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // Frontend only for now — backend wiring comes later
    const subject = encodeURIComponent(`Quote request — ${form.service || 'service'}`);
    const lines = QUOTE_FIELDS.map((f) => `${f.label}: ${form[f.name] || ''}`);
    if (form.details) lines.push(`Additional details: ${form.details}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className={`quote-card ${flat ? 'quote-card--flat' : ''}`} id="quote-form">
      <div className="quote-card__head">
        <span className="quote-card__head-icon">
          <SendIcon width={22} height={22} />
        </span>
        <div>
          <h3>Request a FREE Quote</h3>
          <p className="quote-card__sub">
            Tell us about your job — we respond within 48 hours.
          </p>
        </div>
        <div className="quote-card__badges">
          <span>
            <ClockIcon width={13} height={13} /> 48h response
          </span>
          <span>
            <ShieldIcon width={13} height={13} /> No obligation
          </span>
        </div>
      </div>

      <form className="quote-form" onSubmit={onSubmit}>
        <div className="qf-full quote-form__chips" role="group" aria-label="Quick service select">
          {SERVICE_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`quote-form__chip ${form.service === chip ? 'is-active' : ''}`}
              onClick={() => setService(chip)}
            >
              {form.service === chip && <CheckIcon width={13} height={13} />}
              {chip}
            </button>
          ))}
        </div>

        {QUOTE_FIELDS.map((field) => (
          <label key={field.name} className={FULL_WIDTH.has(field.name) ? 'qf-full' : ''}>
            <span className="qf-label">
              {field.label}
              {field.required ? <span className="qf-req"> *</span> : ''}
            </span>
            <span className="qf-control">
              <span className="qf-icon">{FIELD_ICONS[field.name]}</span>
              <input
                name={field.name}
                type={TYPE_OVERRIDES[field.name] || field.type}
                min={field.name === 'stairs' ? 0 : undefined}
                required={field.required}
                value={form[field.name]}
                onChange={onChange}
                placeholder={field.label}
              />
            </span>
          </label>
        ))}

        <label className="qf-full">
          <span className="qf-label">Anything else we should know?</span>
          <span className="qf-control qf-control--area">
            <textarea
              name="details"
              rows={4}
              value={form.details}
              onChange={onChange}
              placeholder="Item list, access notes, elevator, parking, photos coming by email…"
            />
          </span>
        </label>

        <div className="qf-full">
          <span className="qf-label">Attach Files</span>
          <div className="quote-form__dropzone" title="File upload connects when the backend is ready">
            <PaperclipIcon width={20} height={20} />
            <div>
              <strong>Attachments (0)</strong>
              <p>Photo uploads connect when the backend is ready — for now, mention photos in the message.</p>
            </div>
          </div>
        </div>

        {sent && (
          <p className="quote-form__success">
            <CheckIcon width={15} height={15} /> Opening your email app to send the quote request to{' '}
            {SITE.email}…
          </p>
        )}

        <div className="qf-full">
          <button type="submit" className="pt-btn pt-btn--primary pt-btn--lg quote-form__submit">
            Send My Quote Request <SendIcon width={17} height={17} />
          </button>
        </div>

        <p className="quote-form__note qf-full">
          <ShieldIcon width={13} height={13} /> This site is protected by reCAPTCHA and the Google
          Privacy Policy and Terms of Service apply.
        </p>
      </form>
    </div>
  );
}
