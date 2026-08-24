import express from 'express';
import cors from 'cors';
import quickbooksRouter from './routes/quickbooks.js';
import businessSettingsRouter from './routes/businessSettings.js';
import chatRouter from './routes/chat.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'precise-timing-server' });
  });

  app.use('/api/quickbooks', quickbooksRouter);
  app.use('/api/business-settings', businessSettingsRouter);
  app.use('/api/chat', chatRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
