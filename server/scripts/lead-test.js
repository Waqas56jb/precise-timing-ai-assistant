/**
 * Test lead capture + quote flow end-to-end.
 * Usage: npm run db:seed-pricing && npm run lead:test
 */
import { sendChatMessage } from '../src/services/chat.js';

const r1 = await sendChatMessage({
  visitorId: `lead-test-${Date.now()}`,
  message:
    'Hi, I need a quote. My name is John Smith, phone 513-555-0199, email john@example.com. Moving 2 bedroom from 45202 Cincinnati to 45402 Dayton on 2026-09-15.',
});

console.log('Turn 1:');
console.log({
  conversationId: r1.conversationId,
  lead: r1.lead,
  quote: r1.quote,
  intent: r1.intent,
  replyPreview: r1.reply.slice(0, 200) + '...',
});

process.exit(0);
