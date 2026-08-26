import { upsertExternalLead, markLeadNotified } from '../leads.js';
import { isMailerConfigured, sendInboundLeadEmail } from '../mailer.js';

function leadFingerprint(lead) {
  return JSON.stringify([
    lead.name,
    lead.phone,
    lead.email,
    lead.pickup_address,
    lead.dropoff_address,
    lead.move_date,
    lead.move_size,
    lead.notes,
  ]);
}

async function notifyInboundLead(lead, created) {
  if (!lead || !isMailerConfigured()) return;
  const fingerprint = leadFingerprint(lead);
  if (lead.metadata?.notify_fingerprint === fingerprint) return;
  try {
    await sendInboundLeadEmail({ lead, isUpdate: !created });
    await markLeadNotified(lead.id, fingerprint);
  } catch (err) {
    console.warn('Inbound lead email failed:', err.message);
  }
}

/**
 * Persist a normalized external lead (from Thumbtack / Yelp parsers).
 */
export async function ingestNormalizedLead(source, normalized) {
  if (!normalized) {
    const err = new Error('Empty lead payload');
    err.status = 400;
    throw err;
  }

  const hasContact = normalized.name || normalized.phone || normalized.email;
  const hasDetails =
    normalized.pickup_address ||
    normalized.dropoff_address ||
    normalized.move_size ||
    normalized.move_date ||
    normalized.notes;

  if (!hasContact && !hasDetails) {
    const err = new Error('Lead must include contact info or job details');
    err.status = 400;
    throw err;
  }

  const result = await upsertExternalLead({
    source,
    externalId: normalized.externalId,
    name: normalized.name,
    phone: normalized.phone,
    email: normalized.email,
    pickup_address: normalized.pickup_address,
    dropoff_address: normalized.dropoff_address,
    move_date: normalized.move_date,
    move_size: normalized.move_size,
    notes: normalized.notes,
    metadata: normalized.metadata || {},
  });

  await notifyInboundLead(result.lead, result.created);
  return result;
}
