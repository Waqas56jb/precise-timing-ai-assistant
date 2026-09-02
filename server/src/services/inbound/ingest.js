import { upsertExternalLead, markLeadNotified, getLeadById, markLeadBooked } from '../leads.js';
import { isMailerConfigured, sendInboundLeadEmail } from '../mailer.js';
import {
  isMarketplaceAiChannel,
  replyToMarketplaceMessage,
} from '../chat.js';
import { getRecentMessages } from '../conversations.js';
import { deliverYelpInboxReply } from '../yelp/inboxReply.js';
import { env } from '../../config/env.js';

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
    lead.metadata?.ai_reply_fingerprint || null,
  ]);
}

async function notifyInboundLead(lead, created, extras = {}) {
  if (!lead || !isMailerConfigured()) return;
  const fingerprint = leadFingerprint(lead);
  if (lead.metadata?.notify_fingerprint === fingerprint) return;
  try {
    await sendInboundLeadEmail({
      lead,
      isUpdate: !created,
      aiReply: extras.aiReply || lead.metadata?.ai_reply || null,
      transcript: extras.transcript || null,
      inboxSent: extras.inboxSent,
    });
    await markLeadNotified(lead.id, fingerprint);
  } catch (err) {
    console.warn('Inbound lead email failed:', err.message);
  }
}

async function autoReplyMarketplaceLead(lead, source) {
  if (!isMarketplaceAiChannel(source)) {
    return { lead, aiReply: null, transcript: null, inbox: { sent: false } };
  }
  if (!env.OPENAI_API_KEY) {
    console.warn('Skipping Yelp AI reply — OPENAI_API_KEY is not set');
    return { lead, aiReply: null, transcript: null, inbox: { sent: false } };
  }

  try {
    const result = await replyToMarketplaceMessage({
      lead,
      channel: source,
    });
    const afterDraft = (await getLeadById(lead.id)) || lead;
    let inbox = { sent: false };
    if (String(source).toLowerCase() === 'yelp' && result.reply) {
      inbox = await deliverYelpInboxReply(afterDraft, result.reply);
      if (!inbox.sent) {
        console.warn('Yelp inbox auto-send skipped:', inbox.reason);
      }
    }
    const updated = (await getLeadById(lead.id)) || afterDraft;
    const transcript = result.conversationId
      ? await getRecentMessages(result.conversationId, 20)
      : [];
    return { lead: updated, aiReply: result.reply, transcript, inbox };
  } catch (err) {
    console.warn('Yelp AI reply failed:', err.message);
    return { lead, aiReply: null, transcript: null, inbox: { sent: false } };
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

  const replied = await autoReplyMarketplaceLead(result.lead, source);
  const yelpStatus = String(replied.lead?.metadata?.yelp_status || '').toLowerCase();
  let lead = replied.lead;
  if (['scheduled', 'done'].includes(yelpStatus) && lead.status !== 'booked') {
    lead = (await markLeadBooked(lead.id, { yelp_status: yelpStatus })) || lead;
  }
  await notifyInboundLead(lead, result.created, {
    aiReply: replied.aiReply,
    transcript: replied.transcript,
    inboxSent: Boolean(replied.inbox?.sent && !replied.inbox?.skipped),
  });

  return {
    ...result,
    lead,
    aiReply: replied.aiReply,
    inbox: replied.inbox || { sent: false },
  };
}
