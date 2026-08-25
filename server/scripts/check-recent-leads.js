import { query } from '../src/lib/db.js';

const { rows } = await query(
  `SELECT id, source, name, email, phone, created_at
   FROM precise_timing_ai_assistant_leads
   WHERE source = 'website_form'
   ORDER BY created_at DESC
   LIMIT 3`
);
for (const r of rows) {
  console.log(r.created_at, '|', r.name, '|', r.email, '|', r.phone);
}
process.exit(0);
