import OpenAI from 'openai';
import { env } from '../config/env.js';
import { buildSystemPrompt } from './promptBuilder.js';
import {
  addMessage,
  createConversation,
  getChatHistory,
  getConversation,
} from './conversations.js';

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

  const [systemPrompt, history] = await Promise.all([
    buildSystemPrompt(),
    getChatHistory(conversation.id),
  ]);

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...history],
    temperature: 0.7,
    max_tokens: 800,
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

  return {
    conversationId: conversation.id,
    visitorId: conversation.visitor_id,
    reply,
    messageId: assistantMessage.id,
    tokensUsed,
  };
}

export { getConversationWithMessages } from './conversations.js';
