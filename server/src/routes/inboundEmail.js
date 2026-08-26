import { Router } from 'express';
import { requireAdminOrCron } from '../middleware/adminAuth.js';
import {
  isEmailWorkerConfigured,
  getImapCredentials,
  pollLeadEmails,
} from '../services/inbound/emailWorker.js';

const router = Router();

router.get('/status', (_req, res) => {
  const creds = getImapCredentials();
  res.json({
    ok: true,
    configured: isEmailWorkerConfigured(),
    enabled: ['1', 'true', 'yes', 'on'].includes(
      String(process.env.EMAIL_WORKER_ENABLED || '').toLowerCase()
    ),
    host: creds.host || null,
    user: creds.user || null,
    intervalMs: Number(process.env.EMAIL_WORKER_INTERVAL_MS || 60000),
    note: 'Polls Gmail IMAP for Yelp + Thumbtack lead emails and saves to leads. Uses EMAIL_USER / EMAIL_APP_PASSWORD when IMAP_* is unset.',
  });
});

async function runPoll(req, res) {
  try {
    if (!isEmailWorkerConfigured()) {
      return res.status(503).json({
        error:
          'IMAP not configured. Set EMAIL_USER + EMAIL_APP_PASSWORD (Gmail app password) on the server.',
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
}

router.post('/poll', requireAdminOrCron, runPoll);
/** Vercel Cron hits GET with Authorization: Bearer CRON_SECRET */
router.get('/poll', requireAdminOrCron, runPoll);

export default router;
