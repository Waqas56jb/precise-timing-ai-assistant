import { createApp } from './app.js';
import { env } from './config/env.js';
import { getSupabase } from './lib/supabase.js';
import { migrateFileTokensToDb } from './services/quickbooks/tokenStore.js';
import { startEmailWorker } from './services/inbound/emailWorker.js';
import { seedDefaultAdmin } from './services/adminUsers.js';

const app = createApp();

/** True when running as a Vercel serverless function (no long-lived process). */
const isServerless = Boolean(process.env.VERCEL);

process.on('unhandledRejection', (err) => {
  console.warn('Unhandled rejection:', err?.message || err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err?.message || err);
});

async function bootstrap() {
  const host = process.env.HOST || '0.0.0.0';
  const parsedPort = Number(process.env.PORT || env.PORT || 3001);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3001;
  await new Promise((resolve, reject) => {
    const server = app.listen(port, host, resolve);
    server.on('error', reject);
  });
  console.log(`Server listening on http://${host}:${port}`);
  console.log(`Health: http://${host}:${port}/health`);
  console.log(`Chat API: http://${host}:${port}/api/chat/message`);
  console.log(`Yelp/Thumbtack: http://${host}:${port}/api/yelp/status`);

  try {
    const supabase = getSupabase();
    if (supabase) {
      console.log('Supabase client ready (service_role)');
    } else {
      console.log('Supabase service_role not set — using Postgres pool for DB');
    }
  } catch (err) {
    console.warn('Supabase skipped:', err.message);
  }

  try {
    const result = await migrateFileTokensToDb();
    if (result.migrated) {
      console.log(`QuickBooks tokens migrated to DB (realm: ${result.realmId})`);
    }
  } catch (err) {
    console.warn('QB token migration skipped:', err.message);
  }

  try {
    const admin = await seedDefaultAdmin();
    console.log(`Admin account ready: ${admin.email}`);
  } catch (err) {
    console.warn('Admin seed skipped:', err.message);
  }

  try {
    const worker = startEmailWorker();
    if (worker.started) {
      console.log(`[email-worker] started (${worker.intervalMs || ''}ms)`);
    } else if (worker.reason !== 'EMAIL_WORKER_ENABLED is not true') {
      console.log(`[email-worker] not started: ${worker.reason}`);
    }
  } catch (err) {
    console.warn('[email-worker] failed to start:', err.message);
  }
}

// Vercel imports this file via api/index.js — never call listen() there.
if (!isServerless) {
  bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err?.message || err);
  });
}

export default app;
