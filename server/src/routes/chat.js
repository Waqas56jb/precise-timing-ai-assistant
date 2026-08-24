import { Router } from 'express';
import { z, ZodError } from 'zod';
import { sendChatMessage, getConversationWithMessages } from '../services/chat.js';
import { getPublicBusinessSettings } from '../services/businessSettings.js';

const router = Router();

const messageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  visitorId: z.string().max(100).optional(),
  message: z.string().min(1).max(4000),
});

router.post('/message', async (req, res) => {
  try {
    const body = messageSchema.parse(req.body);
    const result = await sendChatMessage(body);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/welcome', async (_req, res) => {
  try {
    const settings = await getPublicBusinessSettings();
    res.json({
      welcomeMessage:
        settings?.chatbot_welcome_message ||
        'Hi! How can we help with your move or delivery today?',
      businessName: settings?.business_name || 'Precise Timing Transports',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations/:id', async (req, res) => {
  try {
    const data = await getConversationWithMessages(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
