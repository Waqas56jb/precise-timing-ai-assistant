import {
  emailBodyToText,
  extractLabeledFields,
  mapCommonLeadFields,
  pickFirst,
  normalizePhone,
  normalizeEmail,
  normalizeDate,
} from '../inbound/parseHelpers.js';

/**
 * Normalize a Yelp lead from:
 * - Partner / Zapier webhook JSON
 * - Request-a-Quote (RAQ) notification email
 * Official Yelp Leads API is partner-only; Fusion API is separate (business search).
 */

function fromWebhookPayload(body = {}) {
  const root = body.lead || body.data || body.event || body;
  const customer = root.customer || root.user || root.contact || {};
  const project = root.project || root.request || root.details || {};

  const externalId = pickFirst(
    root.id,
    root.lead_id,
    root.leadId,
    body.lead_id,
    body.id,
    body.external_id
  );

  const name = pickFirst(
    customer.name,
    customer.display_name,
    [customer.first_name, customer.last_name].filter(Boolean).join(' '),
    root.customer_name,
    root.name
  );

  return {
    externalId: externalId ? String(externalId) : null,
    name: name || null,
    phone: normalizePhone(
      pickFirst(customer.phone, customer.phone_number, root.phone, root.customer_phone)
    ),
    email: normalizeEmail(
      pickFirst(customer.email, root.email, root.customer_email)
    ),
    pickup_address: pickFirst(
      project.location,
      project.address,
      root.location,
      root.address,
      root.pickup_address
    ) || null,
    dropoff_address: pickFirst(root.dropoff_address, project.destination) || null,
    move_date: normalizeDate(
      pickFirst(project.availability, project.date, root.move_date, root.service_date)
    ),
    move_size: pickFirst(project.job_size, project.size, root.move_size) || null,
    notes: pickFirst(
      project.message,
      project.description,
      root.message,
      root.notes,
      root.last_event_message
    ),
    metadata: {
      provider: 'yelp',
      event: body.event_type || body.type || body.event || null,
      business_id: pickFirst(root.business_id, body.business_id) || null,
      raw_keys: Object.keys(body || {}),
    },
  };
}

function fromEmail({ subject, text, html } = {}) {
  const bodyText = emailBodyToText({ subject, text, html });
  const labeled = extractLabeledFields(bodyText);
  const mapped = mapCommonLeadFields(labeled);

  const idMatch =
    bodyText.match(/lead\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i) ||
    bodyText.match(/conversation\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i);

  const externalId = idMatch?.[1] || null;

  if (!mapped.notes) {
    mapped.notes = bodyText.slice(0, 2000) || null;
  }

  // Yelp RAQ often puts customer info near "New message" / "Request a Quote"
  if (!mapped.name) {
    const m = bodyText.match(/(?:from|customer|name)\s*[:\-]\s*([^\n]+)/i);
    if (m) mapped.name = m[1].trim();
  }

  return {
    externalId,
    ...mapped,
    metadata: {
      provider: 'yelp',
      channel: 'email',
      subject: subject || null,
    },
  };
}

export function parseYelpLead(input = {}) {
  if (input.subject || input.text || input.html) {
    return fromEmail(input);
  }
  return fromWebhookPayload(input);
}
