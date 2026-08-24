import { query } from '../lib/db.js';
import { T } from '../db/tables.js';

export async function createConversation({ visitorId, channel = 'website' } = {}) {
  const { rows } = await query(
    `INSERT INTO ${T.conversations} (channel, visitor_id, status)
     VALUES ($1, $2, 'open')
     RETURNING *`,
    [channel, visitorId || null]
  );
  return rows[0];
}

export async function getConversation(id) {
  const { rows } = await query(
    `SELECT * FROM ${T.conversations} WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getMessages(conversationId, limit = 50) {
  const { rows } = await query(
    `SELECT id, role, content, tokens_used, created_at
     FROM ${T.messages}
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return rows;
}

export async function addMessage({ conversationId, role, content, tokensUsed = null }) {
  const { rows } = await query(
    `INSERT INTO ${T.messages} (conversation_id, role, content, tokens_used)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [conversationId, role, content, tokensUsed]
  );

  await query(
    `UPDATE ${T.conversations} SET updated_at = now() WHERE id = $1`,
    [conversationId]
  );

  return rows[0];
}

export async function getConversationWithMessages(conversationId) {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;
  const messages = await getMessages(conversationId);
  return { ...conversation, messages };
}

/** OpenAI chat format from stored messages (excludes system). */
export async function getChatHistory(conversationId, limit = 20) {
  const messages = await getMessages(conversationId, limit);
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
}
