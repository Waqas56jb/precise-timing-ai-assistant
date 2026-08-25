import { createApp } from './app.js';
import { env } from './config/env.js';
import { getSupabase } from './lib/supabase.js';
import { migrateFileTokensToDb } from './services/quickbooks/tokenStore.js';
import { startEmailWorker } from './services/inbound/emailWorker.js';

const app = createApp();

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

  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
    console.log(`Business settings: http://localhost:${env.PORT}/api/business-settings`);
    console.log(`Chat API: http://localhost:${env.PORT}/api/chat/message`);
    console.log(`Yelp/Thumbtack: http://localhost:${env.PORT}/api/yelp/status`);

    const worker = startEmailWorker();
    if (!worker.started && worker.reason !== 'EMAIL_WORKER_ENABLED is not true') {
      console.log(`[email-worker] not started: ${worker.reason}`);
    }
  });
}

bootstrap();
