/**
 * Seed sample services + pricing rules for quote testing.
 * SAFE: only inserts if no pricing rules exist.
 * Usage: npm run db:seed-pricing
 */
import { query } from '../src/lib/db.js';
import { T } from '../src/db/tables.js';

const { rows: existing } = await query(
  `SELECT COUNT(*)::int AS count FROM ${T.pricingRules}`
);

if (existing[0].count > 0) {
  console.log('Pricing rules already exist — skipping seed.');
  process.exit(0);
}

const { rows: services } = await query(
  `INSERT INTO ${T.services} (name, description, sort_order)
   VALUES
     ('Local Moving', 'Residential moves within the service area', 1),
     ('Delivery', 'Furniture and item delivery', 2)
   RETURNING id, name`
);

const localMoveId = services.find((s) => s.name === 'Local Moving')?.id;

await query(
  `INSERT INTO ${T.pricingRules}
     (name, service_id, move_size, base_price, price_per_mile, price_per_hour, min_price, currency)
   VALUES
     ('Studio move', $1, 'studio', 199, 2.00, 75, 175, 'USD'),
     ('1 Bedroom move', $1, '1BR', 299, 2.25, 85, 275, 'USD'),
     ('2 Bedroom move', $1, '2BR', 399, 2.50, 95, 350, 'USD'),
     ('3 Bedroom move', $1, '3BR', 549, 2.75, 110, 475, 'USD')`,
  [localMoveId]
);

console.log('Seeded 4 pricing rules + 2 services.');
process.exit(0);
