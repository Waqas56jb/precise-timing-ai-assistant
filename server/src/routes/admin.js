import { Router } from 'express';
import { getAdminSecret, signAdminToken } from '../middleware/adminAuth.js';
import { isMailerConfigured } from '../services/mailer.js';
import { getImapCredentials, isEmailWorkerConfigured } from '../services/inbound/emailWorker.js';
import { seedDefaultAdmin, verifyAdminPassword } from '../services/adminUsers.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      await seedDefaultAdmin();
    } catch (err) {
      console.warn('Admin seed skipped:', err.message);
    }

    const user = await verifyAdminPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      token: signAdminToken(user),
      email: user.email,
      name: user.full_name || 'Admin',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (_req, res) => {
  const imap = getImapCredentials();
  res.json({
    ok: true,
    adminConfigured: true,
    emailConfigured: isMailerConfigured(),
    imapConfigured: isEmailWorkerConfigured(),
    imapUser: imap.user || null,
    imapHost: imap.host || null,
    loginHint: 'Use admin@gmail.com',
    legacySecret: Boolean(getAdminSecret()),
  });
});

export default router;
