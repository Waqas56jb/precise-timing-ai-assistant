import { upsertExternalLead } from '../leads.js';

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

  return upsertExternalLead({
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
}
