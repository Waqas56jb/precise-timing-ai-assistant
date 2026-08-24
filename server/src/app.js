import express from 'express';
import cors from 'cors';
import quickbooksRouter from './routes/quickbooks.js';
import businessSettingsRouter from './routes/businessSettings.js';
import chatRouter from './routes/chat.js';
import leadsRouter from './routes/leads.js';
import quotesRouter from './routes/quotes.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'precise-timing-server' });
  });

  app.use('/api/quickbooks', quickbooksRouter);
  app.use('/api/business-settings', businessSettingsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/quotes', quotesRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
