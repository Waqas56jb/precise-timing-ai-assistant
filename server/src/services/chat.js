import { createHash } from 'crypto';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { buildSystemPrompt } from './promptBuilder.js';
import {
  addMessage,
  createConversation,
  getChatHistory,
  getConversation,
  getRecentMessages,
} from './conversations.js';
import {
  extractLeadFromMessages,
  shouldCaptureLead,
  canCalculateQuote,
  isConfirmedBooking,
} from './leadExtractor.js';
import {
  upsertLeadFromExtraction,
  getLeadByConversationId,
  getLeadById,
  markLeadNotified,
  attachConversationToLead,
  mergeLeadMetadata,
  markLeadBooked,
  createBookingRecord,
} from './leads.js';
import { createOrUpdateQuote } from './quotes.js';
import { sendChatbotLeadEmail, isMailerConfigured } from './mailer.js';
import { getBusinessSettings } from './businessSettings.js';

const DEFAULT_WEBSITE_URL = 'https://www.precisetimingtransports.com/';

let openai;

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in server/.env');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openai;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const CHAT_MEMORY = 10;
const MAX_TOKENS = 220;

function sanitizeChatMessages(messages) {
  return messages.filter(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant' || m.role === 'system') &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0
  );
}

function leadFingerprint(lead) {
  return JSON.stringify([
    lead.name,
    lead.phone,
    lead.email,
    lead.pickup_address,
    lead.dropoff_address,
    lead.move_date,
    lead.move_size,
  ]);
}

/**
 * Email the company when the chatbot captures a lead. Sends once when the
 * customer becomes contactable (phone or email), and again only if the core
 * lead info changes afterwards — never on every chat message.
 */
async function notifyChatbotLead(lead, transcript, { booked = false } = {}) {
  if (!lead || !isMailerConfigured()) return;
  if (!lead.phone && !lead.email && !booked) return;

  if (booked) {
    if (lead.metadata?.booked_notified_at) return;
    await sendChatbotLeadEmail({ lead, transcript, booked: true });
    await mergeLeadMetadata(lead.id, { booked_notified_at: new Date().toISOString() });
    return;
  }

  const fingerprint = leadFingerprint(lead);
  const previous = lead.metadata?.notify_fingerprint || null;
  if (previous === fingerprint) return;

  await sendChatbotLeadEmail({ lead, transcript, isUpdate: Boolean(previous) });
  await markLeadNotified(lead.id, fingerprint);
}

async function processLeadAndQuote(conversationId) {
  try {
    const messages = await getRecentMessages(conversationId, 20);
    const extracted = await extractLeadFromMessages(messages);

    let lead = null;
    let quote = null;

    if (shouldCaptureLead(extracted)) {
      lead = await upsertLeadFromExtraction({ conversationId, extracted });
    }

    if (canCalculateQuote(extracted)) {
      quote = await createOrUpdateQuote({
        leadId: lead?.id ?? null,
        conversationId,
        extracted,
      });
    }

    if (lead && isConfirmedBooking(extracted)) {
      lead = await markLeadBooked(lead.id, { intentType: extracted.intentType });
      await createBookingRecord({
        leadId: lead.id,
        conversationId,
        pickupAddress: lead.pickup_address,
        dropoffAddress: lead.dropoff_address,
        notes: lead.notes,
      });
      await notifyChatbotLead(lead, messages, { booked: true });
    } else if (lead) {
      await notifyChatbotLead(lead, messages);
    }
  } catch (err) {
    console.warn('Background lead/quote sync failed:', err.message);
  }
}

function formatLeadResponse(lead) {
  if (!lead) return null;
  return {
    id: lead.id,
    status: lead.status,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    move_size: lead.move_size,
  };
}

export async function sendChatMessage({ conversationId, visitorId, message }) {
  let conversation;

  if (conversationId) {
    conversation = await getConversation(conversationId);
    if (!conversation) {
      const err = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }
  } else {
    conversation = await createConversation({ visitorId, channel: 'website' });
  }

  await addMessage({
    conversationId: conversation.id,
    role: 'user',
    content: message,
  });

  const leadPromise = conversationId
    ? getLeadByConversationId(conversation.id)
    : Promise.resolve(null);

  const [history, lead, systemPrompt] = await Promise.all([
    getChatHistory(conversation.id, CHAT_MEMORY),
    leadPromise,
    leadPromise.then((l) => buildSystemPrompt(conversation.id, l)),
  ]);

  const openAiMessages = sanitizeChatMessages([
    { role: 'system', content: systemPrompt },
    ...history,
  ]);

  if (!openAiMessages.length || openAiMessages[0].role !== 'system') {
    throw new Error('Chat system prompt is missing');
  }

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: openAiMessages,
    temperature: 0.4,
    max_tokens: MAX_TOKENS,
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('Empty response from OpenAI');
  }

  const tokensUsed = completion.usage?.total_tokens ?? null;

  const assistantMessage = await addMessage({
    conversationId: conversation.id,
    role: 'assistant',
    content: reply,
    tokensUsed,
  });

  // Lead + quote sync in background — do not block the chat reply.
  // On Vercel the function freezes right after the response is returned,
  // killing setImmediate work — waitUntil() keeps it alive until done.
  const backgroundSync = processLeadAndQuote(conversation.id);
  if (process.env.VERCEL) {
    try {
      const { waitUntil } = await import('@vercel/functions');
      waitUntil(backgroundSync);
    } catch (err) {
      console.warn('waitUntil unavailable:', err.message);
    }
  }

  return {
    conversationId: conversation.id,
    visitorId: conversation.visitor_id,
    reply,
    messageId: assistantMessage.id,
    tokensUsed,
    lead: formatLeadResponse(lead),
    quote: null,
    intent: null,
  };
}

const MARKETPLACE_MAX_TOKENS = 350;
const MARKETPLACE_NOTE_LIMIT = 2500;

function envFlag(name, fallback = true) {
  const v = process.env[name];
  if (v == null || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

export function isMarketplaceAiChannel(source) {
  return String(source || '').toLowerCase() === 'yelp' && envFlag('YELP_AI_REPLY', true);
}

function marketplaceLabel(channel) {
  const key = String(channel || '').toLowerCase();
  if (key === 'thumbtack') return 'Thumbtack';
  if (key === 'yelp') return 'Yelp';
  return key || 'marketplace';
}

function messageFingerprint(text) {
  return createHash('sha256').update(String(text || '')).digest('hex').slice(0, 32);
}

export function buildMarketplaceCustomerMessage(lead, channel = 'yelp') {
  const label = marketplaceLabel(channel);
  const lines = [`New ${label} inquiry.`];
  if (lead?.name) lines.push(`Customer name: ${lead.name}`);
  if (lead?.phone) lines.push(`Phone: ${lead.phone}`);
  if (lead?.email) lines.push(`Email: ${lead.email}`);
  if (lead?.move_size) lines.push(`Service: ${lead.move_size}`);
  if (lead?.pickup_address) lines.push(`Location: ${lead.pickup_address}`);
  if (lead?.dropoff_address) lines.push(`Drop-off: ${lead.dropoff_address}`);
  if (lead?.move_date) lines.push(`Date requested: ${lead.move_date}`);
  const notes = String(lead?.notes || '').trim();
  if (notes) {
    lines.push('', 'Customer message:', notes.slice(0, MARKETPLACE_NOTE_LIMIT));
  } else {
    lines.push(
      '',
      `The customer reached out on ${label} about moving, delivery, or junk removal. Reply and ask for the details needed for a quote.`
    );
  }
  return lines.join('\n');
}

function marketplaceWebsiteUrl(settings) {
  const raw = String(settings?.website_url || DEFAULT_WEBSITE_URL).trim();
  if (!raw) return DEFAULT_WEBSITE_URL;
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function marketplaceSystemExtra(channel, websiteUrl) {
  const label = marketplaceLabel(channel);
  const site = marketplaceWebsiteUrl({ website_url: websiteUrl });
  return `## ${label} marketplace reply
This inquiry came from ${label}. This reply is sent into the ${label} inbox as the first answer.
- Do not mention AI, this dashboard, email automation, or that this is a suggested reply
- Sound like a real staff member at the company
- 4–8 sentences, friendly and professional
- Acknowledge their request and any details we already know
- Ask at most one short question
- Always include this exact website link: ${site}
- Tell them the fastest way to get a quote and book is to open that site and use the chat (bottom right) or the quote form — we will collect their details there
- Invite them to call or text the company phone if they prefer
- Do not invent prices or promise a specific quote amount
- Do not use markdown headings
- Plain text only`;
}

async function generateMarketplaceAssistantReply({
  conversationId,
  lead,
  extraSystem,
  freshDraft = false,
}) {
  const [history, systemPrompt] = await Promise.all([
    getChatHistory(conversationId, CHAT_MEMORY),
    buildSystemPrompt(conversationId, lead),
  ]);

  let context = history;
  if (freshDraft) {
    const lastUser = [...history].reverse().find((m) => m.role === 'user');
    context = lastUser ? [lastUser] : history;
  }

  const openAiMessages = sanitizeChatMessages([
    { role: 'system', content: `${systemPrompt}\n\n${extraSystem}` },
    ...context,
  ]);

  if (!openAiMessages.length || openAiMessages[0].role !== 'system') {
    throw new Error('Chat system prompt is missing');
  }

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: openAiMessages,
    temperature: 0.4,
    max_tokens: MARKETPLACE_MAX_TOKENS,
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('Empty response from OpenAI');
  }

  const tokensUsed = completion.usage?.total_tokens ?? null;
  const assistantMessage = await addMessage({
    conversationId,
    role: 'assistant',
    content: reply,
    tokensUsed,
  });

  return { reply, tokensUsed, assistantMessage };
}

/**
 * Draft a paste-ready reply for a Yelp (or other marketplace) lead.
 * Yelp does not allow posting into their inbox from here — the office copies this.
 */
export async function replyToMarketplaceMessage({
  lead,
  customerMessage,
  channel = 'yelp',
  force = false,
} = {}) {
  if (!lead?.id) {
    throw new Error('Lead is required');
  }
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const source = String(channel || lead.source || 'yelp').toLowerCase();
  const text = String(
    customerMessage || buildMarketplaceCustomerMessage(lead, source)
  ).trim();
  const fingerprint = messageFingerprint(text);
  const previous = lead.metadata && typeof lead.metadata === 'object' ? lead.metadata : {};

  if (!force && previous.ai_reply_fingerprint === fingerprint && previous.ai_reply) {
    return {
      reply: previous.ai_reply,
      conversationId: lead.conversation_id || null,
      skipped: true,
    };
  }

  let conversationId = lead.conversation_id || null;
  if (conversationId) {
    const existing = await getConversation(conversationId);
    if (!existing) conversationId = null;
  }

  if (!conversationId) {
    const conv = await createConversation({
      visitorId: `${source}:${lead.id}`,
      channel: source,
    });
    conversationId = conv.id;
    await attachConversationToLead(lead.id, conversationId);
  }

  const recent = await getRecentMessages(conversationId, 8);
  const lastUser = [...recent].reverse().find((m) => m.role === 'user');
  const lastAssistant = [...recent].reverse().find((m) => m.role === 'assistant');

  if (!force && lastUser && lastUser.content.trim() === text && lastAssistant?.content) {
    await mergeLeadMetadata(lead.id, {
      ai_reply: lastAssistant.content,
      ai_reply_at: new Date().toISOString(),
      ai_reply_fingerprint: fingerprint,
    });
    return { reply: lastAssistant.content, conversationId, skipped: true };
  }

  const shouldAddUser = !lastUser || lastUser.content.trim() !== text;

  if (shouldAddUser) {
    await addMessage({
      conversationId,
      role: 'user',
      content: text,
    });
  }

  const freshLead = (await getLeadById(lead.id)) || lead;
  const settings = await getBusinessSettings().catch(() => null);
  const { reply, tokensUsed, assistantMessage } = await generateMarketplaceAssistantReply({
    conversationId,
    lead: freshLead,
    extraSystem: marketplaceSystemExtra(source, marketplaceWebsiteUrl(settings)),
    freshDraft: force,
  });

  await mergeLeadMetadata(lead.id, {
    ai_reply: reply,
    ai_reply_at: new Date().toISOString(),
    ai_reply_fingerprint: fingerprint,
  });

  return {
    reply,
    conversationId,
    skipped: false,
    tokensUsed,
    messageId: assistantMessage.id,
  };
}

export { getConversationWithMessages } from './conversations.js';
