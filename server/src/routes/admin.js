import { Router } from 'express';
import { getAdminSecret } from '../middleware/adminAuth.js';
import { isMailerConfigured } from '../services/mailer.js';
import { getImapCredentials, isEmailWorkerConfigured } from '../services/inbound/emailWorker.js';

const router = Router();

router.post('/login', (req, res) => {
  const secret = getAdminSecret();
  if (!secret) {
    return res.status(503).json({ error: 'Admin is not configured. Set ADMIN_SECRET on the server.' });
  }
  const password = String(req.body?.password || '');
  if (password !== secret) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.json({
    token: secret,
    name: 'Precise Timing Admin',
  });
});

router.get('/status', (_req, res) => {
  const imap = getImapCredentials();
  res.json({
    ok: true,
    adminConfigured: Boolean(getAdminSecret()),
    emailConfigured: isMailerConfigured(),
    imapConfigured: isEmailWorkerConfigured(),
    imapUser: imap.user || null,
    imapHost: imap.host || null,
  });
});

export default router;
