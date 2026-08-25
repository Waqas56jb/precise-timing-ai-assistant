import { useState } from 'react';
import { HOME, QUOTE_FIELDS, SITE } from '../data/site';

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
    // Frontend only for now — backend later
    const subject = encodeURIComponent(`Quote request — ${form.service || 'service'}`);
    const body = encodeURIComponent(
      QUOTE_FIELDS.map((f) => `${f.label}: ${form[f.name] || ''}`).join('\n')
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form className="quote-form" onSubmit={onSubmit} id="quote-form">
      {QUOTE_FIELDS.map((field) => (
        <label key={field.name}>
          {field.label}
          {field.required ? '*' : ''}
          <input
            name={field.name}
            type={field.type}
            required={field.required}
            value={form[field.name]}
            onChange={onChange}
          />
        </label>
      ))}

      <label>
        Attach Files
        <input type="file" multiple disabled title="File upload will connect when backend is ready" />
      </label>
      <p className="quote-form__note">Attachments (0) — file upload wiring comes with backend.</p>

      {sent && (
        <p className="quote-form__success">
          Opening your email app to send the quote request to {SITE.email}…
        </p>
      )}

      <button type="submit" className="pt-btn pt-btn--primary">
        Send
      </button>
      <p className="quote-form__note">
        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
      </p>
      <p className="quote-form__note">{HOME.contactIntro}</p>
    </form>
  );
}
