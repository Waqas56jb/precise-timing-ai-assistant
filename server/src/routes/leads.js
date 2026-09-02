import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  listLeads,
  countLeads,
  getLeadById,
  getLeadStats,
  getLeadAnalytics,
  updateLead,
  deleteLead,
  getLeadQuotes,
} from '../services/leads.js';
import { getMessages } from '../services/conversations.js';
import { replyToMarketplaceMessage, isMarketplaceAiChannel } from '../services/chat.js';
import { deliverYelpInboxReply } from '../services/yelp/inboxReply.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  try {
    res.json(await getLeadStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (_req, res) => {
  try {
    res.json(await getLeadAnalytics());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status || null;
    const source = req.query.source || null;
    const q = req.query.q || null;
    const [leads, total] = await Promise.all([
      listLeads({ limit, offset, status, source, q }),
      countLeads({ status, source, q }),
    ]);
    res.json({ leads, total, limit, offset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const [messages, quotes] = await Promise.all([
      lead.conversation_id ? getMessages(lead.conversation_id, 200) : [],
      getLeadQuotes(lead.id),
    ]);
    res.json({ ...lead, messages, quotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const lead = await updateLead(req.params.id, req.body || {});
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteLead(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Lead not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/ai-reply', async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    if (!isMarketplaceAiChannel(lead.source)) {
      return res.status(400).json({
        error: 'AI replies are only generated for Yelp leads.',
      });
    }

    const result = await replyToMarketplaceMessage({
      lead,
      channel: lead.source,
      force: Boolean(req.body?.force),
    });
    let afterDraft = (await getLeadById(lead.id)) || lead;
    if (result.reply) {
      await deliverYelpInboxReply(afterDraft, result.reply, {
        force: Boolean(req.body?.force),
      });
    }
    const updated = await getLeadById(lead.id);
    const [messages, quotes] = await Promise.all([
      result.conversationId || updated?.conversation_id
        ? getMessages(result.conversationId || updated.conversation_id, 200)
        : [],
      getLeadQuotes(lead.id),
    ]);
    res.json({
      ...updated,
      messages,
      quotes,
      aiReply: result.reply,
      skipped: result.skipped,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
