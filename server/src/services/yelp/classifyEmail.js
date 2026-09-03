/**
 * Yelp emails include two different things:
 * - Direct leads: a customer messaged / requested a quote from THIS business.
 * - Nearby jobs: marketplace jobs Yelp blasts to matching businesses in the area.
 * We only auto-reply to direct leads.
 */

const NEARBY_HINTS = [
  'nearby job',
  'nearby jobs',
  'jobs near you',
  'job near you',
  'a job near you',
  'new job near you',
  'jobs in your area',
  'job in your area',
  'a job in your area',
  'customer near you',
  'customers near you',
  'new jobs matching',
  'job matching your',
  'matching your services',
  'available to businesses',
  'shared with businesses',
  'sent to businesses near',
  'businesses in your area',
  'respond to this job',
  'see this job',
  'view this job',
  'unlock this job',
  'unlock this lead',
  'purchase this lead',
  'pay to contact',
  'nearby_jobs',
  '/nearby-jobs',
  'yelp.com/nearby',
  'opportunities near you',
];

const DIRECT_HINTS = [
  'new message from',
  'sent you a message',
  'you have a new message',
  'you received a message',
  'messaged your business',
  'contacted your business',
  'requested a quote',
  'request a quote from',
  'wants a quote from',
  'quote request for',
  'view conversation',
  'view this conversation',
  'reply to this customer',
  'reply to this message',
  'yelp messaging',
  '/conversations/',
  'message from a yelp',
];

function blobOf({ subject = '', text = '', html = '', from = '' } = {}) {
  return `${subject}\n${from}\n${text}\n${html}`.toLowerCase();
}

function hitCount(blob, hints) {
  return hints.filter((hint) => blob.includes(hint));
}

export function classifyYelpNotification(input = {}) {
  const blob = blobOf(input);
  const fromL = String(input.from || '').toLowerCase();
  const nearbyHits = hitCount(blob, NEARBY_HINTS);
  const directHits = hitCount(blob, DIRECT_HINTS);

  if (
    /nearby|jobs@|job-alert|opportunities@|digest@/.test(fromL) &&
    !/messag/.test(fromL)
  ) {
    return { type: 'nearby_job', reason: 'from_address' };
  }

  if (nearbyHits.length && !directHits.length) {
    return { type: 'nearby_job', reason: nearbyHits[0] };
  }

  if (directHits.length && !nearbyHits.length) {
    return { type: 'direct_lead', reason: directHits[0] };
  }

  if (nearbyHits.length && directHits.length) {
    if (nearbyHits.some((h) => h.includes('nearby') || h.includes('in your area'))) {
      return { type: 'nearby_job', reason: nearbyHits[0] };
    }
    return { type: 'direct_lead', reason: directHits[0] };
  }

  return { type: 'unknown', reason: 'no_match' };
}

/** Save + AI-reply only when a customer contacted this business. */
export function isYelpDirectLead(input = {}) {
  return classifyYelpNotification(input).type === 'direct_lead';
}

/** Nearby job emails should not become leads or get an AI reply. */
export function isYelpNearbyJob(input = {}) {
  return classifyYelpNotification(input).type === 'nearby_job';
}
