import { useRef, useState } from 'react';
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

/* Attachment limits — the API (Vercel) accepts ~4.5 MB per request */
const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 3.5 * 1024 * 1024;
const ACCEPT = 'image/*,.pdf,.doc,.docx,.txt';

/** Downscale photos in the browser so uploads stay small and fast. */
async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function formatBytes(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function QuoteForm({ flat = false }) {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]); // [{ id, file, preview }]
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setService = (value) => setForm((prev) => ({ ...prev, service: value }));

  const addFiles = async (incoming) => {
    setFileError('');
    const picked = Array.from(incoming || []);
    if (!picked.length) return;

    let next = [...files];
    for (const raw of picked) {
      if (next.length >= MAX_FILES) {
        setFileError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      const file = await compressImage(raw);
      const total = next.reduce((sum, f) => sum + f.file.size, 0) + file.size;
      if (total > MAX_TOTAL_BYTES) {
        setFileError('Attachments are limited to about 3.5 MB in total — some files were not added.');
        break;
      }
      next.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      });
    }
    setFiles(next);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
    setFileError('');
  };

  const clearFiles = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer?.files);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      files.forEach((f) => body.append('files', f.file, f.file.name));

      const res = await fetch(`${API_BASE}/api/contact`, { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setForm(EMPTY_FORM());
      clearFiles();
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
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className={`quote-form__dropzone ${dragOver ? 'is-dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <PaperclipIcon width={20} height={20} />
            <div>
              <strong>Attachments ({files.length}/{MAX_FILES})</strong>
              <p>
                Click or drop photos of your items here — images, PDF, or Word files, up to{' '}
                {MAX_FILES} files.
              </p>
            </div>
          </button>

          {files.length > 0 && (
            <ul className="quote-form__files">
              {files.map((f) => (
                <li key={f.id} className="quote-form__file">
                  {f.preview ? (
                    <img src={f.preview} alt="" />
                  ) : (
                    <span className="quote-form__file-ic">
                      <PaperclipIcon width={16} height={16} />
                    </span>
                  )}
                  <span className="quote-form__file-name">
                    {f.file.name}
                    <small>{formatBytes(f.file.size)}</small>
                  </span>
                  <button
                    type="button"
                    className="quote-form__file-remove"
                    aria-label={`Remove ${f.file.name}`}
                    onClick={() => removeFile(f.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {fileError && (
            <p className="quote-form__file-error" role="alert">
              {fileError}
            </p>
          )}
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
