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
} from './leadExtractor.js';
import { upsertLeadFromExtraction, getLeadByConversationId } from './leads.js';
import { createOrUpdateQuote } from './quotes.js';

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

  // Lead + quote sync in background — do not block the chat reply
  setImmediate(() => {
    processLeadAndQuote(conversation.id);
  });

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

export { getConversationWithMessages } from './conversations.js';
