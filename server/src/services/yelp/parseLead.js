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
 * Yelp lead normalize (Precise Timing Transports — Aug 24 findings)
 *
 * Dashboard fields: customer name, service type, zip, lead created datetime,
 * dates requested, free-text details, status (New/Active/Scheduled/Done/Archived).
 *
 * Capture path: IMAP of precisetimingtransports@gmail.com, filter sender *@yelp.com
 * → parse email → leads.source = 'yelp'
 *
 * Official Yelp Integrations page has no webhook/API (Housecall Pro / Calendly only).
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

  const serviceType = pickFirst(
    project.service_type,
    project.category,
    root.service_type,
    root.service
  );
  const zip = pickFirst(project.zip, project.zip_code, root.zip, root.zip_code);

  return {
    externalId: externalId ? String(externalId) : null,
    name: name || null,
    phone: normalizePhone(
      pickFirst(customer.phone, customer.phone_number, root.phone, root.customer_phone)
    ),
    email: normalizeEmail(pickFirst(customer.email, root.email, root.customer_email)),
    pickup_address:
      pickFirst(
        project.location,
        project.address,
        root.location,
        root.address,
        root.pickup_address,
        zip
      ) || null,
    dropoff_address: pickFirst(root.dropoff_address, project.destination) || null,
    move_date: normalizeDate(
      pickFirst(
        project.availability,
        project.dates_requested,
        project.date,
        root.move_date,
        root.service_date
      )
    ),
    move_size: pickFirst(serviceType, project.job_size, project.size, root.move_size) || null,
    notes: pickFirst(
      project.message,
      project.description,
      project.details,
      root.message,
      root.notes,
      root.last_event_message
    ),
    metadata: {
      provider: 'yelp',
      event: body.event_type || body.type || body.event || null,
      business_id: pickFirst(root.business_id, body.business_id) || null,
      service_type: serviceType || null,
      zip: zip || null,
      yelp_status: pickFirst(root.status, project.status) || null,
      raw_keys: Object.keys(body || {}),
    },
  };
}

function grab(bodyText, patterns) {
  for (const re of patterns) {
    const m = bodyText.match(re);
    if (m?.[1]) return m[1].replace(/\s+/g, ' ').trim();
  }
  return null;
}

function fromEmail({ subject, text, html } = {}) {
  const bodyText = emailBodyToText({ subject, text, html });
  const labeled = extractLabeledFields(bodyText);
  const mapped = mapCommonLeadFields(labeled);

  const serviceType = pickFirst(
    labeled.service_type,
    labeled.service,
    labeled.category,
    grab(bodyText, [
      /service\s*type\s*[:\-]\s*([^\n]+)/i,
      /looking\s+for\s*[:\-]\s*([^\n]+)/i,
      /category\s*[:\-]\s*([^\n]+)/i,
    ])
  );

  const zip = pickFirst(
    labeled.zip,
    labeled.zip_code,
    labeled.postal_code,
    grab(bodyText, [
      /zip(?:\s*code)?\s*[:\-]\s*(\d{5}(?:-\d{4})?)/i,
      /\b(\d{5})(?:-\d{4})?\b.*(?:area|location|near)/i,
    ])
  );

  const datesRequested = pickFirst(
    labeled.dates_requested,
    labeled.date_requested,
    labeled.preferred_date,
    labeled.availability,
    grab(bodyText, [
      /dates?\s*requested\s*[:\-]\s*([^\n]+)/i,
      /preferred\s*dates?\s*[:\-]\s*([^\n]+)/i,
      /availability\s*[:\-]\s*([^\n]+)/i,
      /when\s*do\s*you\s*need\s*[:\-]\s*([^\n]+)/i,
    ])
  );

  const yelpStatus = pickFirst(
    labeled.status,
    labeled.lead_status,
    grab(bodyText, [/lead\s*status\s*[:\-]\s*(New|Active|Scheduled|Done|Archived)/i])
  );

  const details = pickFirst(
    mapped.notes,
    labeled.details,
    labeled.message,
    labeled.project_details,
    grab(bodyText, [
      /(?:project\s*)?details\s*[:\-]\s*([^\n]+(?:\n(?![A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*[:\-])[^\n]+)*)/i,
      /additional\s*(?:details|info(?:rmation)?)\s*[:\-]\s*([^\n]+)/i,
      /message\s*[:\-]\s*([^\n]+)/i,
    ])
  );

  const name = pickFirst(
    mapped.name,
    labeled.customer_name,
    grab(bodyText, [
      /customer\s*(?:name)?\s*[:\-]\s*([^\n]+)/i,
      /from\s*[:\-]\s*([^\n]+)/i,
      /new\s+message\s+from\s+([^\n(]+)/i,
    ])
  );

  const idMatch =
    bodyText.match(/lead\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i) ||
    bodyText.match(/conversation\s*(?:id|#)?\s*[:#]?\s*([A-Za-z0-9_-]{6,})/i) ||
    bodyText.match(/biz\.yelp\.com\/[^\s"'<>]*?\/([A-Za-z0-9_-]{8,})/i);

  const externalId = idMatch?.[1] || null;

  const noteParts = [];
  if (details) noteParts.push(details);
  if (serviceType) noteParts.push(`Service: ${serviceType}`);
  if (datesRequested) noteParts.push(`Dates requested: ${datesRequested}`);
  if (yelpStatus) noteParts.push(`Yelp status: ${yelpStatus}`);

  return {
    externalId,
    name: name || null,
    phone: mapped.phone,
    email: mapped.email,
    pickup_address: pickFirst(mapped.pickup_address, zip ? `ZIP ${zip}` : null),
    dropoff_address: mapped.dropoff_address,
    move_date: normalizeDate(datesRequested) || mapped.move_date,
    move_size: pickFirst(serviceType, mapped.move_size),
    notes: noteParts.length ? noteParts.join('\n') : bodyText.slice(0, 2000) || null,
    metadata: {
      provider: 'yelp',
      channel: 'email',
      subject: subject || null,
      service_type: serviceType || null,
      zip: zip || null,
      dates_requested: datesRequested || null,
      yelp_status: yelpStatus || null,
      business: 'Precise Timing Transports',
      notification_inbox: 'precisetimingtransports@gmail.com',
    },
  };
}

export function parseYelpLead(input = {}) {
  if (input.subject || input.text || input.html) {
    return fromEmail(input);
  }
  return fromWebhookPayload(input);
}
