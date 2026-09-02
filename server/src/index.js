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
  const supabase = getSupabase();
  if (supabase) {
    console.log('Supabase client ready (service_role)');
  } else {
    console.log('Supabase service_role not set — using Postgres pool for DB');
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

  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(env.PORT, host, () => {
    console.log(`Server listening on http://${host}:${env.PORT}`);
    console.log(`Health: http://${host}:${env.PORT}/health`);
    console.log(`Chat API: http://${host}:${env.PORT}/api/chat/message`);
    console.log(`Yelp/Thumbtack: http://${host}:${env.PORT}/api/yelp/status`);

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
  });

  server.on('error', (err) => {
    console.error('HTTP server error:', err.message);
    process.exit(1);
  });
}

// Vercel imports this file via api/index.js — never call listen() there.
if (!isServerless) {
  bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err?.message || err);
    process.exit(1);
  });
}

export default app;
