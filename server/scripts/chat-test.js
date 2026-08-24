/**
 * Test chat API with OpenAI.
 * Usage: npm run chat:test
 */
import { sendChatMessage } from '../src/services/chat.js';

const result = await sendChatMessage({
  visitorId: `test-${Date.now()}`,
  message: 'Hi, I need a quote for a 2 bedroom move from Cincinnati to Dayton next Saturday.',
});

console.log('Chat OK');
console.log(result);
