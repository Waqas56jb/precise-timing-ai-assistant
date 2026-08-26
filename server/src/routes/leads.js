import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  listLeads,
  countLeads,
  getLeadById,
  getLeadStats,
  updateLeadStatus,
  getLeadQuotes,
} from '../services/leads.js';
import { getMessages } from '../services/conversations.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  try {
    res.json(await getLeadStats());
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
    const status = String(req.body?.status || '').trim();
    const lead = await updateLeadStatus(req.params.id, status);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
