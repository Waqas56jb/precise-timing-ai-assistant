import express from 'express';
import cors from 'cors';
import quickbooksRouter from './routes/quickbooks.js';
import businessSettingsRouter from './routes/businessSettings.js';
import chatRouter from './routes/chat.js';
import leadsRouter from './routes/leads.js';
import quotesRouter from './routes/quotes.js';
import contactRouter from './routes/contact.js';
import thumbtackRouter from './routes/thumbtack.js';
import yelpRouter from './routes/yelp.js';
import inboundEmailRouter from './routes/inboundEmail.js';
import adminRouter from './routes/admin.js';
import { isMailerConfigured } from './services/mailer.js';
import { isEmailWorkerConfigured } from './services/inbound/emailWorker.js';
import { getAdminSecret } from './middleware/adminAuth.js';

function healthPayload() {
  return {
    ok: true,
    service: 'precise-timing-server',
    emailConfigured: isMailerConfigured(),
    imapConfigured: isEmailWorkerConfigured(),
    adminConfigured: Boolean(getAdminSecret()),
  };
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret'],
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => res.json(healthPayload()));
  app.get('/health', (_req, res) => res.json(healthPayload()));
  app.get('/api/health', (_req, res) => res.json(healthPayload()));

  app.use('/api/quickbooks', quickbooksRouter);
  app.use('/api/business-settings', businessSettingsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/quotes', quotesRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/thumbtack', thumbtackRouter);
  app.use('/api/yelp', yelpRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/inbound-email', inboundEmailRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
