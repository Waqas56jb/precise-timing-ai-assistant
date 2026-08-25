import { Router } from 'express';
import {
  isEmailWorkerConfigured,
  pollLeadEmails,
} from '../services/inbound/emailWorker.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    configured: isEmailWorkerConfigured(),
    enabled: ['1', 'true', 'yes', 'on'].includes(
      String(process.env.EMAIL_WORKER_ENABLED || '').toLowerCase()
    ),
    host: process.env.IMAP_HOST || null,
    user: process.env.IMAP_USER || null,
    intervalMs: Number(process.env.EMAIL_WORKER_INTERVAL_MS || 60000),
    note: 'Polls IMAP for Yelp/Thumbtack lead emails and saves to leads table.',
  });
});

/** Manual trigger: poll once now */
router.post('/poll', async (_req, res) => {
  try {
    if (!isEmailWorkerConfigured()) {
      return res.status(503).json({
        error: 'IMAP not configured. Set IMAP_HOST, IMAP_USER, IMAP_PASSWORD in .env',
      });
    }
    const result = await pollLeadEmails({
      markSeen: process.env.IMAP_MARK_SEEN !== 'false',
      limit: Number(process.env.IMAP_BATCH_LIMIT || 30),
      unseenOnly: process.env.IMAP_UNSEEN_ONLY !== 'false',
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
