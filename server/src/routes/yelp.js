import { Router } from 'express';
import { requireWebhookSecret } from '../middleware/webhookAuth.js';
import { parseYelpLead } from '../services/yelp/parseLead.js';
import { ingestNormalizedLead } from '../services/inbound/ingest.js';
import {
  isYelpFusionConfigured,
  getYelpBusiness,
  searchYelpBusinesses,
} from '../services/yelp/fusion.js';

const router = Router();
const auth = requireWebhookSecret(['YELP_WEBHOOK_SECRET', 'LEAD_INGEST_SECRET']);

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    provider: 'yelp',
    mode: 'imap_email_poll',
    business: 'Precise Timing Transports',
    location: 'Cincinnati, OH 45251',
    notificationInbox: 'precisetimingtransports@gmail.com',
    fusionConfigured: isYelpFusionConfigured(),
    note: 'No Yelp webhook/API on Integrations (Housecall Pro/Calendly only). Capture = IMAP poll Gmail, filter *@yelp.com → leads source=yelp.',
    endpoints: {
      webhook: 'POST /api/yelp/webhook',
      email: 'POST /api/yelp/email',
      inboundPoll: 'POST /api/inbound-email/poll',
      fusionBusiness: 'GET /api/yelp/business/:id',
      fusionSearch: 'GET /api/yelp/search',
    },
  });
});

/** Partner / Zapier webhook JSON → lead */
router.post('/webhook', auth, async (req, res) => {
  try {
    const normalized = parseYelpLead(req.body || {});
    const result = await ingestNormalizedLead('yelp', normalized);
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
 * Forwarded Yelp RAQ / lead email.
 * Body: { subject, text, html }
 */
router.post('/email', auth, async (req, res) => {
  try {
    const { subject, text, html } = req.body || {};
    if (!subject && !text && !html) {
      return res.status(400).json({ error: 'Provide subject and/or text/html' });
    }
    const normalized = parseYelpLead({ subject, text, html });
    const result = await ingestNormalizedLead('yelp', normalized);
    res.status(result.created ? 201 : 200).json({
      ok: true,
      created: result.created,
      lead: result.lead,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

/** Optional: Yelp Fusion business lookup */
router.get('/business/:id', async (req, res) => {
  try {
    const data = await getYelpBusiness(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, details: err.details });
  }
});

router.get('/search', async (req, res) => {
  try {
    const data = await searchYelpBusinesses({
      term: req.query.term,
      location: req.query.location,
      limit: Math.min(Number(req.query.limit) || 5, 20),
    });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, details: err.details });
  }
});

export default router;
