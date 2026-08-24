import { query } from '../lib/db.js';
import { T } from '../db/tables.js';

export async function loadActivePricingRules() {
  const { rows } = await query(
    `SELECT pr.*, s.name AS service_name
     FROM ${T.pricingRules} pr
     LEFT JOIN ${T.services} s ON s.id = pr.service_id
     WHERE pr.is_active = true
     ORDER BY pr.name ASC`
  );
  return rows;
}

function normalizeMoveSize(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function matchPricingRule(rules, moveSize) {
  if (!rules.length) return null;

  const normalized = normalizeMoveSize(moveSize);
  if (!normalized) return rules[0];

  const direct = rules.find(
    (r) => r.move_size && normalized.includes(normalizeMoveSize(r.move_size))
  );
  if (direct) return direct;

  const patterns = [
    { re: /studio|efficiency|0\s*br/, token: 'studio' },
    { re: /\b1\s*br|\b1\s*bed|one bedroom|1 bedroom/, token: '1' },
    { re: /\b2\s*br|\b2\s*bed|two bedroom|2 bedroom/, token: '2' },
    { re: /\b3\s*br|\b3\s*bed|three bedroom|3 bedroom/, token: '3' },
    { re: /\b4\s*br|\b4\s*bed|four bedroom|4 bedroom/, token: '4' },
  ];

  for (const { re, token } of patterns) {
    if (re.test(normalized)) {
      const match = rules.find(
        (r) => r.move_size && normalizeMoveSize(r.move_size).includes(token)
      );
      if (match) return match;
    }
  }

  return rules[0];
}

export function calculateQuoteAmount({
  pricingRule,
  estimatedMiles = null,
  estimatedHours = null,
}) {
  if (!pricingRule) {
    return { amount: null, lineItems: [], breakdown: { error: 'no_pricing_rule' } };
  }

  const base = Number(pricingRule.base_price) || 0;
  const perMile = Number(pricingRule.price_per_mile) || 0;
  const perHour = Number(pricingRule.price_per_hour) || 0;
  const minPrice = Number(pricingRule.min_price) || 0;
  const currency = pricingRule.currency || 'USD';

  const miles = estimatedMiles != null ? Number(estimatedMiles) : 0;
  const hours = estimatedHours != null ? Number(estimatedHours) : 0;

  const lineItems = [];
  if (base > 0) {
    lineItems.push({
      label: `${pricingRule.name}${pricingRule.move_size ? ` (${pricingRule.move_size})` : ''}`,
      amount: base,
    });
  }
  if (perMile > 0 && miles > 0) {
    const mileageAmount = Math.round(perMile * miles * 100) / 100;
    lineItems.push({ label: `Mileage (${miles} mi)`, amount: mileageAmount });
  }
  if (perHour > 0 && hours > 0) {
    const laborAmount = Math.round(perHour * hours * 100) / 100;
    lineItems.push({ label: `Labor (${hours} hr)`, amount: laborAmount });
  }

  let amount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  if (minPrice > 0 && amount < minPrice) {
    amount = minPrice;
    lineItems.push({ label: 'Minimum price applied', amount: 0, note: true });
  }

  amount = Math.round(amount * 100) / 100;

  return {
    amount,
    currency,
    lineItems,
    breakdown: {
      pricingRuleId: pricingRule.id,
      pricingRuleName: pricingRule.name,
      moveSize: pricingRule.move_size,
      basePrice: base,
      estimatedMiles: miles || null,
      estimatedHours: hours || null,
      minPrice: minPrice || null,
    },
  };
}

export async function calculateQuoteFromDetails({
  moveSize,
  estimatedMiles = null,
  estimatedHours = null,
  pickupAddress = null,
  dropoffAddress = null,
}) {
  const rules = await loadActivePricingRules();
  const pricingRule = matchPricingRule(rules, moveSize);

  let miles = estimatedMiles;
  if (miles == null && pickupAddress && dropoffAddress && pricingRule?.price_per_mile) {
    miles = 20;
  }

  const result = calculateQuoteAmount({
    pricingRule,
    estimatedMiles: miles,
    estimatedHours,
  });

  return {
    ...result,
    ready: Boolean(
      pricingRule &&
        result.amount != null &&
        pickupAddress &&
        dropoffAddress &&
        moveSize
    ),
    pricingRule,
  };
}
