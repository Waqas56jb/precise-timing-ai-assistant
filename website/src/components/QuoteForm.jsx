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

const API_BASE = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3001';

const EMPTY_FORM = () =>
  Object.fromEntries([...QUOTE_FIELDS.map((f) => [f.name, '']), ['details', '']]);

export default function QuoteForm({ flat = false }) {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setService = (value) => setForm((prev) => ({ ...prev, service: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setForm(EMPTY_FORM());
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err.message === 'Failed to fetch'
          ? `We couldn't reach the server. Please try again, or email us at ${SITE.email}.`
          : err.message
      );
    }
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

        {status === 'success' && (
          <p className="quote-form__success qf-full">
            <CheckIcon width={15} height={15} /> Thank you! Your quote request has been sent — we
            respond within 48 hours, often much faster.
          </p>
        )}
        {status === 'error' && (
          <p className="quote-form__error qf-full" role="alert">
            {errorMsg}
          </p>
        )}

        <div className="qf-full">
          <button
            type="submit"
            className="pt-btn pt-btn--primary pt-btn--lg quote-form__submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <>
                Sending… <span className="quote-form__spinner" aria-hidden="true" />
              </>
            ) : (
              <>
                Send My Quote Request <SendIcon width={17} height={17} />
              </>
            )}
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
