/**
 * One-shot or watch IMAP poll for Yelp / Thumbtack lead emails.
 *
 * Usage:
 *   node scripts/email-worker.js           # single poll
 *   node scripts/email-worker.js --watch   # keep polling
 *
 * Required .env:
 *   IMAP_HOST=imap.gmail.com
 *   IMAP_PORT=993
 *   IMAP_USER=business@gmail.com
 *   IMAP_PASSWORD=app_password_not_normal_password
 */
import 'dotenv/config';
import {
  isEmailWorkerConfigured,
  pollLeadEmails,
  startEmailWorker,
} from '../src/services/inbound/emailWorker.js';

const watch = process.argv.includes('--watch');

async function once() {
  if (!isEmailWorkerConfigured()) {
    console.error(
      'Missing IMAP config. Set IMAP_HOST, IMAP_USER, IMAP_PASSWORD in server/.env'
    );
    process.exit(1);
  }

  console.log('Polling mailbox for Yelp / Thumbtack lead emails…');
  const result = await pollLeadEmails({
    markSeen: process.env.IMAP_MARK_SEEN !== 'false',
    limit: Number(process.env.IMAP_BATCH_LIMIT || 30),
    unseenOnly: process.env.IMAP_UNSEEN_ONLY !== 'false',
  });

  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  if (watch) {
    process.env.EMAIL_WORKER_ENABLED = 'true';
    const started = startEmailWorker();
    if (!started.started) {
      console.error(started.reason);
      process.exit(1);
    }
    console.log('Watching… Ctrl+C to stop');
    return;
  }

  await once();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
