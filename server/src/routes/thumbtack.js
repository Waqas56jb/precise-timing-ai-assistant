import { Router } from 'express';
import { requireWebhookSecret } from '../middleware/webhookAuth.js';
import { parseThumbtackLead } from '../services/thumbtack/parseLead.js';
import { ingestNormalizedLead } from '../services/inbound/ingest.js';

const router = Router();
const auth = requireWebhookSecret(['THUMBTACK_WEBHOOK_SECRET', 'LEAD_INGEST_SECRET']);

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    provider: 'thumbtack',
    mode: 'webhook_and_email_parse',
    note: 'Official Thumbtack Partner API needs partner OAuth. Use Zapier/webhook JSON or forwarded lead emails.',
    endpoints: {
      webhook: 'POST /api/thumbtack/webhook',
      email: 'POST /api/thumbtack/email',
    },
  });
});

/** Partner webhook / Zapier JSON → lead */
router.post('/webhook', auth, async (req, res) => {
  try {
    const normalized = parseThumbtackLead(req.body || {});
    const result = await ingestNormalizedLead('thumbtack', normalized);
    res.status(result.created ? 201 : 200).json({
      ok: true,
      created: result.created,
      lead: result.lead,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

/**
 * Forwarded Thumbtack lead email (Zapier Email Parser / IMAP worker / manual).
 * Body: { subject, text, html }
 */
router.post('/email', auth, async (req, res) => {
  try {
    const { subject, text, html } = req.body || {};
    if (!subject && !text && !html) {
      return res.status(400).json({ error: 'Provide subject and/or text/html' });
    }
    const normalized = parseThumbtackLead({ subject, text, html });
    const result = await ingestNormalizedLead('thumbtack', normalized);
    res.status(result.created ? 201 : 200).json({
      ok: true,
      created: result.created,
      lead: result.lead,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
