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
 * Normalize a Thumbtack lead from:
 * - Partner webhook / Zapier JSON
 * - Forwarded lead notification email
 */

function fromWebhookPayload(body = {}) {
  // Support nested shapes: { negotiation }, { lead }, or flat fields
  const root = body.negotiation || body.lead || body.data || body;
  const customer = root.customer || root.customerInfo || root.contact || {};
  const request = root.request || root.job || root.details || {};

  const externalId = pickFirst(
    root.id,
    root.negotiationID,
    root.negotiationId,
    root.leadID,
    root.leadId,
    body.id,
    body.external_id
  );

  const name = pickFirst(
    customer.name,
    customer.displayName,
    [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    root.customerName,
    root.name
  );

  const phone = normalizePhone(
    pickFirst(customer.phone, customer.phoneNumber, root.phone, root.customerPhone)
  );
  const email = normalizeEmail(
    pickFirst(customer.email, customer.emailAddress, root.email, root.customerEmail)
  );

  const pickup = pickFirst(
    request.location,
    request.address,
    request.serviceAddress,
    root.location,
    root.address,
    root.pickup_address
  );

  const notesParts = [
    request.description,
    request.category,
    root.description,
    root.message,
    root.notes,
  ].filter(Boolean);

  return {
    externalId: externalId ? String(externalId) : null,
    name: name || null,
    phone,
    email,
    pickup_address: pickup || null,
    dropoff_address: pickFirst(root.dropoff_address, request.destination) || null,
    move_date: normalizeDate(pickFirst(request.preferredDate, request.date, root.move_date)),
    move_size: pickFirst(request.homeSize, request.size, root.move_size) || null,
    notes: notesParts.length ? notesParts.join('\n') : null,
    metadata: {
      provider: 'thumbtack',
      event: body.eventType || body.type || body.event || null,
      raw_keys: Object.keys(body || {}),
    },
  };
}

function fromEmail({ subject, text, html } = {}) {
  const bodyText = emailBodyToText({ subject, text, html });
  const labeled = extractLabeledFields(bodyText);
  const mapped = mapCommonLeadFields(labeled);

  // Thumbtack emails often include a request / lead id in subject or body
  const idMatch =
    bodyText.match(/lead\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i) ||
    bodyText.match(/negotiation\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i) ||
    bodyText.match(/request\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i);

  const externalId = idMatch?.[1] || null;

  if (!mapped.notes) {
    mapped.notes = bodyText.slice(0, 2000) || null;
  }

  return {
    externalId,
    ...mapped,
    metadata: {
      provider: 'thumbtack',
      channel: 'email',
      subject: subject || null,
    },
  };
}

export function parseThumbtackLead(input = {}) {
  if (input.subject || input.text || input.html) {
    return fromEmail(input);
  }
  return fromWebhookPayload(input);
}
