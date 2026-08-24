/**
 * Shared helpers for Thumbtack / Yelp email + webhook lead parsing.
 */

export function pickFirst(...values) {
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return null;
}

export function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length < 7) return null;
  return digits;
}

export function normalizeEmail(raw) {
  if (!raw) return null;
  const m = String(raw).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : null;
}

/** ISO date if recognizable, else null. */
export function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Pull "Label: value" lines from plain-text emails.
 * Handles "Name:", "Customer name:", "Phone Number:", etc.
 */
export function extractLabeledFields(text) {
  const out = {};
  if (!text) return out;

  const lines = String(text).replace(/\r/g, '').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z][A-Za-z0-9 /_-]{1,40})\s*[:\-]\s*(.+)\s*$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase().replace(/[\s/-]+/g, '_');
    const value = m[2].trim();
    if (value) out[key] = value;
  }
  return out;
}

export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function emailBodyToText({ text, html, subject } = {}) {
  const parts = [];
  if (subject) parts.push(String(subject));
  if (text) parts.push(String(text));
  else if (html) parts.push(stripHtml(html));
  return parts.join('\n\n');
}

/**
 * Map labeled fields + freeform text into a lead-shaped object.
 */
export function mapCommonLeadFields(labeled, extras = {}) {
  const get = (...keys) => {
    for (const k of keys) {
      if (labeled[k]) return labeled[k];
    }
    return null;
  };

  return {
    name: pickFirst(
      extras.name,
      get('name', 'customer_name', 'customer_name', 'customer', 'contact_name', 'full_name')
    ),
    phone: normalizePhone(
      pickFirst(
        extras.phone,
        get('phone', 'phone_number', 'mobile', 'cell', 'customer_phone', 'contact_phone')
      )
    ),
    email: normalizeEmail(
      pickFirst(extras.email, get('email', 'email_address', 'customer_email', 'contact_email'))
    ),
    pickup_address: pickFirst(
      extras.pickup_address,
      get(
        'pickup',
        'pickup_address',
        'from',
        'from_address',
        'origin',
        'starting_address',
        'address',
        'service_address',
        'location'
      )
    ),
    dropoff_address: pickFirst(
      extras.dropoff_address,
      get('dropoff', 'dropoff_address', 'to', 'to_address', 'destination', 'delivery_address')
    ),
    move_date: normalizeDate(
      pickFirst(
        extras.move_date,
        get('date', 'move_date', 'service_date', 'preferred_date', 'job_date', 'when')
      )
    ),
    move_size: pickFirst(
      extras.move_size,
      get('size', 'move_size', 'home_size', 'job_size', 'bedrooms', 'property_size')
    ),
    notes: pickFirst(extras.notes, get('notes', 'message', 'details', 'description', 'request')),
  };
}
