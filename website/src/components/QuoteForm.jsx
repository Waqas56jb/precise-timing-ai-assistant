import { useState } from 'react';
import { QUOTE_FIELDS, SITE } from '../data/site';

/* Fields that span the full width of the form grid */
const FULL_WIDTH = new Set(['pickup', 'dropoff']);

export default function QuoteForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries(QUOTE_FIELDS.map((f) => [f.name, '']))
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Frontend only for now — backend wiring comes later
    const subject = encodeURIComponent(`Quote request — ${form.service || 'service'}`);
    const body = encodeURIComponent(
      QUOTE_FIELDS.map((f) => `${f.label}: ${form[f.name] || ''}`).join('\n')
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="quote-card" id="quote-form">
      <h3>Request a FREE Quote</h3>
      <p className="quote-card__sub">
        Fill out the form and we respond within 48 hours with a quote.
      </p>

      <form className="quote-form" onSubmit={onSubmit}>
        {QUOTE_FIELDS.map((field) => (
          <label key={field.name} className={FULL_WIDTH.has(field.name) ? 'qf-full' : ''}>
            <span>
              {field.label}
              {field.required ? <span className="qf-req">*</span> : ''}
            </span>
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              value={form[field.name]}
              onChange={onChange}
              placeholder={field.label}
            />
          </label>
        ))}

        <label className="qf-full">
          <span>Attach Files</span>
          <input
            type="file"
            multiple
            disabled
            title="File upload will connect when backend is ready"
          />
        </label>
        <p className="quote-form__note qf-full">
          Attachments (0) — file upload connects when the backend is ready.
        </p>

        {sent && (
          <p className="quote-form__success">
            Opening your email app to send the quote request to {SITE.email}…
          </p>
        )}

        <div className="qf-full">
          <button type="submit" className="pt-btn pt-btn--primary pt-btn--lg">
            Send
          </button>
        </div>

        <p className="quote-form__note qf-full">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service
          apply.
        </p>
      </form>
    </div>
  );
}
