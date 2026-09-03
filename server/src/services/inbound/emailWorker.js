import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { env } from '../../config/env.js';
import { detectLeadEmailSource } from './detectSource.js';
import { parseYelpLead } from '../yelp/parseLead.js';
import { isYelpNearbyJob } from '../yelp/classifyEmail.js';
import { parseThumbtackLead } from '../thumbtack/parseLead.js';
import { ingestNormalizedLead } from './ingest.js';

function envBool(name, fallback = false) {
  const v = process.env[name];
  if (v == null || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

/** Gmail IMAP — falls back to EMAIL_USER / EMAIL_APP_PASSWORD (SMTP app password). */
export function getImapCredentials() {
  const user = process.env.IMAP_USER || env.EMAIL_USER || '';
  const pass = process.env.IMAP_PASSWORD || env.EMAIL_APP_PASSWORD || '';
  const host = process.env.IMAP_HOST || env.IMAP_HOST || 'imap.gmail.com';
  const port = Number(process.env.IMAP_PORT || env.IMAP_PORT || 993);
  return { user, pass, host, port };
}

export function isEmailWorkerConfigured() {
  const { user, pass, host } = getImapCredentials();
  return Boolean(host && user && pass);
}

function createClient() {
  const { host, user, pass, port } = getImapCredentials();
  const secure = envBool('IMAP_SECURE', port === 993);

  if (!host || !user || !pass) {
    const err = new Error(
      'IMAP not configured. Set EMAIL_USER + EMAIL_APP_PASSWORD (or IMAP_USER + IMAP_PASSWORD).'
    );
    err.status = 503;
    throw err;
  }

  return new ImapFlow({
    host,
    port,
    secure,
    auth: { user, pass },
    logger: false,
    tls: {
      rejectUnauthorized: envBool('IMAP_TLS_REJECT_UNAUTHORIZED', true),
    },
  });
}

async function parseRawMessage(source) {
  const parsed = await simpleParser(source);
  const text =
    parsed.text ||
    (parsed.html
      ? String(parsed.html)
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, ' ')
      : '');

  const replyToAddresses = (parsed.replyTo?.value || [])
    .map((v) => v.address)
    .filter(Boolean);
  const fromAddress = parsed.from?.value?.[0]?.address || null;

  return {
    messageId: parsed.messageId || null,
    from: parsed.from?.text || '',
    fromAddress,
    replyToAddresses,
    subject: parsed.subject || '',
    text: text || '',
    html: parsed.html || '',
    date: parsed.date || null,
  };
}

function buildNormalized(source, email) {
  const input = {
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  let normalized =
    source === 'yelp' ? parseYelpLead(input) : parseThumbtackLead(input);

  // Prefer Message-ID for stable dedupe across polls
  if (email.messageId) {
    normalized = {
      ...normalized,
      externalId: normalized.externalId || email.messageId,
      metadata: {
        ...(normalized.metadata || {}),
        email_message_id: email.messageId,
        email_from: email.from,
        email_from_address: email.fromAddress || null,
        email_reply_to: email.replyToAddresses || [],
        email_subject: email.subject || null,
        email_date: email.date ? email.date.toISOString() : null,
      },
    };
  }

  return normalized;
}

/**
 * One IMAP poll cycle: fetch recent/unseen mails, ingest Yelp/Thumbtack leads.
 */
export async function pollLeadEmails({
  markSeen = true,
  limit = 30,
  unseenOnly = true,
} = {}) {
  if (!isEmailWorkerConfigured()) {
    return { skipped: true, reason: 'IMAP not configured' };
  }

  const mailbox = process.env.IMAP_MAILBOX || env.IMAP_MAILBOX || 'INBOX';
  const client = createClient();
  const results = {
    scanned: 0,
    ingested: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    leads: [],
  };

  await client.connect();

  try {
    const lock = await client.getMailboxLock(mailbox);
    try {
      let uids;
      // Prefer server-side from-filter when set (e.g. yelp.com for Yelp-only polls)
      const fromFilter = (process.env.IMAP_FROM_FILTER || '').trim();

      if (unseenOnly && fromFilter) {
        uids = await client.search(
          { seen: false, from: fromFilter },
          { uid: true }
        );
      } else if (unseenOnly) {
        uids = await client.search({ seen: false }, { uid: true });
      } else if (fromFilter) {
        uids = await client.search({ from: fromFilter }, { uid: true });
      } else {
        // Last N messages in mailbox
        const status = client.mailbox;
        const total = status?.exists || 0;
        if (!total) uids = [];
        else {
          const start = Math.max(1, total - limit + 1);
          uids = await client.search({ seq: `${start}:*` }, { uid: true });
        }
      }

      if (!Array.isArray(uids)) uids = [];
      uids = uids.slice(-limit);

      for (const uid of uids) {
        results.scanned += 1;
        try {
          const downloaded = await client.download(uid, undefined, { uid: true });
          if (!downloaded?.content) {
            results.skipped += 1;
            continue;
          }

          const email = await parseRawMessage(downloaded.content);
          const source = detectLeadEmailSource(email);

          if (!source) {
            results.skipped += 1;
            if (markSeen && envBool('IMAP_MARK_UNKNOWN_SEEN', false)) {
              await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
            }
            continue;
          }

          if (source === 'yelp' && isYelpNearbyJob(email)) {
            results.skipped += 1;
            if (markSeen) {
              await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
            }
            continue;
          }

          const normalized = buildNormalized(source, email);
          const { lead, created, aiReply, inbox } = await ingestNormalizedLead(source, normalized);

          if (created) results.ingested += 1;
          else results.updated += 1;

          results.leads.push({
            source,
            id: lead.id,
            name: lead.name,
            created,
            aiReply: Boolean(aiReply),
            inboxSent: Boolean(inbox?.sent),
          });

          if (markSeen) {
            await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
          }
        } catch (err) {
          results.errors.push({ uid, error: err.message });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
  }

  return results;
}

let intervalHandle = null;
let pollInFlight = false;

/** Start background polling (for always-on server / VPS). */
export function startEmailWorker() {
  if (!envBool('EMAIL_WORKER_ENABLED', false)) {
    return { started: false, reason: 'EMAIL_WORKER_ENABLED is not true' };
  }
  if (!isEmailWorkerConfigured()) {
    return { started: false, reason: 'IMAP not configured' };
  }
  if (intervalHandle) {
    return { started: true, reason: 'already running' };
  }

  const intervalMs = Math.max(
    30_000,
    Number(process.env.EMAIL_WORKER_INTERVAL_MS || 60_000)
  );

  const tick = async () => {
    if (pollInFlight) return;
    pollInFlight = true;
    try {
      const result = await pollLeadEmails({
        markSeen: envBool('IMAP_MARK_SEEN', true),
        limit: Number(process.env.IMAP_BATCH_LIMIT || 30),
        unseenOnly: envBool('IMAP_UNSEEN_ONLY', true),
      });
      if (!result.skipped && (result.ingested || result.updated || result.errors.length)) {
        console.log(
          `[email-worker] scanned=${result.scanned} new=${result.ingested} updated=${result.updated} errors=${result.errors.length}`
        );
      }
    } catch (err) {
      console.warn('[email-worker] poll failed:', err.message);
    } finally {
      pollInFlight = false;
    }
  };

  // First run shortly after boot
  setTimeout(tick, 5_000);
  intervalHandle = setInterval(tick, intervalMs);

  console.log(
    `[email-worker] started — polling every ${Math.round(intervalMs / 1000)}s`
  );
  return { started: true, intervalMs };
}

export function stopEmailWorker() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
