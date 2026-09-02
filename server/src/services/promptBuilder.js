import { query } from '../lib/db.js';
import { T } from '../db/tables.js';
import { getBusinessSettings } from './businessSettings.js';

async function loadActiveServices() {
  const { rows } = await query(
    `SELECT name, description FROM ${T.services}
     WHERE is_active = true ORDER BY sort_order ASC, name ASC LIMIT 8`
  );
  return rows;
}

async function loadActiveFaqs() {
  const { rows } = await query(
    `SELECT question, answer FROM ${T.faqs}
     WHERE is_active = true ORDER BY sort_order ASC LIMIT 5`
  );
  return rows;
}

async function loadActivePricingRules() {
  const { rows } = await query(
    `SELECT pr.name, pr.move_size, pr.base_price, pr.price_per_mile,
            pr.min_price, s.name AS service_name
     FROM ${T.pricingRules} pr
     LEFT JOIN ${T.services} s ON s.id = pr.service_id
     WHERE pr.is_active = true ORDER BY pr.name ASC LIMIT 8`
  );
  return rows;
}

async function loadActiveServiceAreas() {
  const { rows } = await query(
    `SELECT name, city, state FROM ${T.serviceAreas}
     WHERE is_active = true ORDER BY name ASC LIMIT 10`
  );
  return rows;
}

function formatPricing(rules) {
  if (!rules.length) return 'Ask team for pricing.';
  return rules
    .map((r) => {
      const parts = [r.move_size || r.name];
      if (r.base_price != null) parts.push(`$${r.base_price} base`);
      if (r.price_per_mile != null) parts.push(`$${r.price_per_mile}/mi`);
      if (r.min_price != null) parts.push(`min $${r.min_price}`);
      return `- ${parts.join(', ')}`;
    })
    .join('\n');
}

function formatAreas(areas) {
  if (!areas.length) return 'Ask pickup/dropoff city or ZIP.';
  return areas.map((a) => `- ${[a.name, a.city, a.state].filter(Boolean).join(', ')}`).join('\n');
}

function formatFaqs(faqs) {
  if (!faqs.length) return '';
  return faqs.map((f) => `- ${f.question} → ${f.answer}`).join('\n');
}

function formatLeadMemory(lead) {
  if (!lead) return '';

  const known = [];
  if (lead.name) known.push(`Name: ${lead.name}`);
  if (lead.phone) known.push(`Phone: ${lead.phone}`);
  if (lead.email) known.push(`Email: ${lead.email}`);
  if (lead.pickup_address) known.push(`Pickup: ${lead.pickup_address}`);
  if (lead.dropoff_address) known.push(`Dropoff: ${lead.dropoff_address}`);
  if (lead.move_date) known.push(`Date: ${lead.move_date}`);
  if (lead.move_size) known.push(`Size: ${lead.move_size}`);

  if (!known.length) return '';
  return `\n## Customer memory (do NOT re-ask)\n${known.join('\n')}`;
}

let cachedBasePrompt = null;
let cacheTime = 0;
const CACHE_MS = 3 * 60 * 1000;

async function buildBasePrompt() {
  if (cachedBasePrompt && Date.now() - cacheTime < CACHE_MS) {
    return cachedBasePrompt;
  }

  const [settings, services, faqs, pricing, areas] = await Promise.all([
    getBusinessSettings(),
    loadActiveServices(),
    loadActiveFaqs(),
    loadActivePricingRules(),
    loadActiveServiceAreas(),
  ]);

  const name = settings?.business_name || 'Precise Timing Transports';
  const phone = settings?.business_phone || '';
  const bookingUrl = settings?.godaddy_booking_url || '';
  const websiteUrl = settings?.website_url || 'https://www.precisetimingtransports.com/';
  const extra = settings?.chatbot_system_prompt_extra || '';
  const servicesList = services.length
    ? services.map((s) => s.name).join(', ')
    : 'Local moving & delivery';

  cachedBasePrompt = { name, phone, bookingUrl, websiteUrl, extra, servicesList, areas, pricing, faqs };
  cacheTime = Date.now();
  return cachedBasePrompt;
}

export async function buildSystemPrompt(_conversationId = null, lead = null) {
  const [base, leadMemory] = await Promise.all([
    buildBasePrompt(),
    Promise.resolve(formatLeadMemory(lead)),
  ]);

  const { name, phone, bookingUrl, websiteUrl, extra, servicesList, areas, pricing, faqs } = base;

  return `You are the assistant for ${name} (US moving/delivery).

## Style
- Helpful and concise: ~4-6 sentences, or a brief intro plus 2-4 bullet points.
- Professional tone. Use **bold** for key details; use bullet lists with dashes.
- Keep markdown tight — no ### headings, no extra blank lines between lines.
- One question at a time for quotes. Use conversation memory — never repeat.

## Quote order
1. Move size → 2. Pickup → 3. Dropoff → 4. Date → 5. Name → 6. Phone/email

## Booking
Website (chat + quote form): ${websiteUrl}
${bookingUrl ? `Booking link: ${bookingUrl}` : 'Team follows up after details.'}

Phone: ${phone || 'after lead'} | Services: ${servicesList}

Areas: ${formatAreas(areas)}
Pricing: ${formatPricing(pricing)}
${formatFaqs(faqs) ? `FAQs: ${formatFaqs(faqs)}` : ''}
${leadMemory}

Rules: No invented prices. No AI mention.${extra ? ` ${extra}` : ''}`.trim();
}
