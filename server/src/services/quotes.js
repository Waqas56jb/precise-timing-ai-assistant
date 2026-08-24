import { query } from '../lib/db.js';
import { T } from '../db/tables.js';
import { calculateQuoteFromDetails } from './pricing.js';

function quoteNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  return `PT-${stamp}`;
}

export async function getLatestQuoteForConversation(conversationId) {
  const { rows } = await query(
    `SELECT * FROM ${T.quotes}
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [conversationId]
  );
  return rows[0] || null;
}

export async function createOrUpdateQuote({
  leadId,
  conversationId,
  extracted,
}) {
  const calc = await calculateQuoteFromDetails({
    moveSize: extracted.move_size,
    estimatedMiles: extracted.estimated_miles,
    estimatedHours: extracted.estimated_hours,
    pickupAddress: extracted.pickup_address,
    dropoffAddress: extracted.dropoff_address,
  });

  if (!calc.ready || calc.amount == null) {
    return null;
  }

  const existing = await getLatestQuoteForConversation(conversationId);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  if (existing && existing.status === 'draft') {
    const { rows } = await query(
      `UPDATE ${T.quotes}
       SET amount = $1,
           line_items = $2,
           pricing_breakdown = $3,
           valid_until = $4,
           lead_id = COALESCE($5, lead_id),
           updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [
        calc.amount,
        JSON.stringify(calc.lineItems),
        JSON.stringify(calc.breakdown),
        validUntil.toISOString().slice(0, 10),
        leadId,
        existing.id,
      ]
    );
    return rows[0];
  }

  const { rows } = await query(
    `INSERT INTO ${T.quotes}
       (lead_id, conversation_id, quote_number, amount, currency, status,
        line_items, pricing_breakdown, valid_until)
     VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8)
     RETURNING *`,
    [
      leadId,
      conversationId,
      quoteNumber(),
      calc.amount,
      calc.currency,
      JSON.stringify(calc.lineItems),
      JSON.stringify(calc.breakdown),
      validUntil.toISOString().slice(0, 10),
    ]
  );
  return rows[0];
}

export async function listQuotes({ limit = 50 } = {}) {
  const { rows } = await query(
    `SELECT * FROM ${T.quotes} ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export function formatQuoteForChat(quote) {
  if (!quote?.amount) return '';
  return (
    `\n\n### Estimated quote\n**$${Number(quote.amount).toFixed(2)}** · #${quote.quote_number}\n_Estimate only — final price may vary._`
  );
}
