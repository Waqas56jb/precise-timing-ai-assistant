/**
 * Smoke-test Thumbtack / Yelp lead ingest against a running server.
 * Usage: node scripts/lead-ingest-test.js
 */
const BASE = process.env.API_BASE || 'http://127.0.0.1:3001';
const SECRET = process.env.LEAD_INGEST_SECRET || process.env.THUMBTACK_WEBHOOK_SECRET || '';

async function post(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (SECRET) headers['X-Webhook-Secret'] = SECRET;

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  console.log(`\n${res.status} ${path}`);
  console.log(JSON.stringify(data, null, 2));
  if (!res.ok) process.exitCode = 1;
  return data;
}

async function main() {
  console.log('Testing Thumbtack webhook…');
  await post('/api/thumbtack/webhook', {
    id: `tt_test_${Date.now()}`,
    customer: { name: 'Alex Thumbtack', phone: '555-0101', email: 'alex.tt@example.com' },
    request: {
      category: 'Local moving',
      location: 'Austin, TX 78701',
      description: '2 bedroom apartment move',
      preferredDate: '2026-09-15',
      homeSize: '2BR',
    },
  });

  console.log('\nTesting Thumbtack email parse…');
  await post('/api/thumbtack/email', {
    subject: 'New Thumbtack lead',
    text: `Name: Sam Movers
Phone: (555) 222-3333
Email: sam@example.com
Pickup: 100 Main St, Dallas TX
Dropoff: 200 Oak Ave, Plano TX
Date: 2026-10-01
Size: 1 bedroom
Notes: Stairs, no elevator
Lead ID: TT-EMAIL-001`,
  });

  console.log('\nTesting Yelp webhook…');
  await post('/api/yelp/webhook', {
    lead_id: `yelp_test_${Date.now()}`,
    customer: { name: 'Jordan Yelp', phone: '555-0202', email: 'jordan.yelp@example.com' },
    project: {
      location: 'Houston, TX',
      message: 'Need help moving a couch and boxes',
      date: '2026-09-20',
      job_size: 'studio',
    },
  });

  console.log('\nTesting Yelp email parse…');
  await post('/api/yelp/email', {
    subject: 'New message from a Yelp customer',
    text: `Customer name: Riley RAQ
Phone number: 555-444-5555
Email: riley@example.com
Address: 50 Westheimer Rd, Houston TX
Message: Looking for a weekend local move
Lead ID: YELP-EMAIL-001`,
  });

  console.log('\nDone. List leads: GET /api/leads?source=thumbtack or ?source=yelp');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
