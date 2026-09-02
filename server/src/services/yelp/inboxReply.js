import { mergeLeadMetadata } from '../leads.js';
import { isMailerConfigured, sendYelpInboxReply } from '../mailer.js';

function addressesFrom(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => addressesFrom(item))
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    if (value.address) return [String(value.address)];
    if (Array.isArray(value.value)) return addressesFrom(value.value);
  }
  const text = String(value);
  const found = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return found;
}

function isUsableYelpAddress(addr) {
  const a = String(addr || '').toLowerCase().trim();
  if (!a.includes('@')) return false;
  const domain = a.split('@')[1] || '';
  if (!domain.includes('yelp.')) return false;
  const local = a.split('@')[0];
  if (/^(noreply|no-reply|donotreply|do-not-reply|notifications|notify|mailer)$/i.test(local)) {
    return false;
  }
  return true;
}

export function pickYelpInboxAddress(leadOrMeta = {}) {
  const meta =
    leadOrMeta.metadata && typeof leadOrMeta.metadata === 'object'
      ? leadOrMeta.metadata
      : leadOrMeta;
  const candidates = [
    ...addressesFrom(meta.email_reply_to),
    ...addressesFrom(meta.yelp_reply_to),
    ...addressesFrom(meta.email_from_address),
    ...addressesFrom(meta.email_from),
    ...addressesFrom(leadOrMeta.email),
  ];
  return candidates.find(isUsableYelpAddress) || null;
}

/**
 * Email the Yelp thread. Yelp posts the first reply into the business inbox
 * when you reply to the lead notification from the account email.
 */
export async function deliverYelpInboxReply(lead, text, { force = false } = {}) {
  const reply = String(text || '').trim();
  if (!lead?.id || !reply) {
    return { sent: false, reason: 'missing_reply' };
  }

  const meta = lead.metadata && typeof lead.metadata === 'object' ? lead.metadata : {};
  const to = pickYelpInboxAddress(lead);
  if (!to) {
    return { sent: false, reason: 'no_yelp_reply_address' };
  }

  const fingerprint = meta.ai_reply_fingerprint || reply.slice(0, 80);
  if (!force && meta.yelp_inbox_reply_fingerprint === fingerprint && meta.yelp_inbox_replied_at) {
    return { sent: true, skipped: true, to, reason: 'already_sent' };
  }

  if (!isMailerConfigured()) {
    await mergeLeadMetadata(lead.id, {
      yelp_inbox_error: 'Mailer not configured',
    });
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const result = await sendYelpInboxReply({
      to,
      subject: meta.subject || meta.email_subject || 'Your inquiry',
      text: reply,
      inReplyTo: meta.email_message_id || null,
    });
    if (!result.sent) {
      await mergeLeadMetadata(lead.id, {
        yelp_inbox_error: result.reason || 'send_failed',
      });
      return { sent: false, reason: result.reason || 'send_failed', to };
    }

    await mergeLeadMetadata(lead.id, {
      yelp_inbox_replied_at: new Date().toISOString(),
      yelp_inbox_reply_to: to,
      yelp_inbox_reply_fingerprint: fingerprint,
      yelp_inbox_message_id: result.messageId || null,
      yelp_inbox_error: null,
    });
    return { sent: true, to, messageId: result.messageId };
  } catch (err) {
    await mergeLeadMetadata(lead.id, {
      yelp_inbox_error: err.message,
    });
    return { sent: false, reason: err.message, to };
  }
}
