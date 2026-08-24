import { query } from '../lib/db.js';
import { T } from '../db/tables.js';
import { getBusinessSettings } from './businessSettings.js';

async function loadActiveServices() {
  const { rows } = await query(
    `SELECT name, description FROM ${T.services}
     WHERE is_active = true ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}

async function loadActiveFaqs() {
  const { rows } = await query(
    `SELECT question, answer, category FROM ${T.faqs}
     WHERE is_active = true ORDER BY sort_order ASC LIMIT 30`
  );
  return rows;
}

async function loadActivePricingRules() {
  const { rows } = await query(
    `SELECT pr.name, pr.move_size, pr.base_price, pr.price_per_mile,
            pr.price_per_hour, pr.min_price, pr.currency, s.name AS service_name
     FROM ${T.pricingRules} pr
     LEFT JOIN ${T.services} s ON s.id = pr.service_id
     WHERE pr.is_active = true
     ORDER BY pr.name ASC`
  );
  return rows;
}

async function loadActiveServiceAreas() {
  const { rows } = await query(
    `SELECT name, city, state, zip_codes, notes FROM ${T.serviceAreas}
     WHERE is_active = true ORDER BY name ASC`
  );
  return rows;
}

function formatPricing(rules) {
  if (!rules.length) return 'Pricing rules not configured yet. Collect move details and offer to have the team follow up with a quote.';
  return rules
    .map((r) => {
      const parts = [];
      if (r.service_name) parts.push(`Service: ${r.service_name}`);
      if (r.move_size) parts.push(`Move size: ${r.move_size}`);
      if (r.base_price != null) parts.push(`Base: $${r.base_price}`);
      if (r.price_per_mile != null) parts.push(`Per mile: $${r.price_per_mile}`);
      if (r.price_per_hour != null) parts.push(`Per hour: $${r.price_per_hour}`);
      if (r.min_price != null) parts.push(`Minimum: $${r.min_price}`);
      return `- ${r.name}: ${parts.join(', ') || 'See admin for details'}`;
    })
    .join('\n');
}

function formatAreas(areas) {
  if (!areas.length) return 'Service areas not configured yet. Ask for pickup and dropoff addresses.';
  return areas
    .map((a) => {
      const loc = [a.name, a.city, a.state].filter(Boolean).join(', ');
      const zips = a.zip_codes?.length ? ` (ZIPs: ${a.zip_codes.join(', ')})` : '';
      return `- ${loc}${zips}${a.notes ? ` — ${a.notes}` : ''}`;
    })
    .join('\n');
}

function formatFaqs(faqs) {
  if (!faqs.length) return 'No FAQs configured.';
  return faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
}

function formatServices(services) {
  if (!services.length) return 'Local moving and delivery services.';
  return services.map((s) => `- ${s.name}${s.description ? `: ${s.description}` : ''}`).join('\n');
}

export async function buildSystemPrompt() {
  const [settings, services, faqs, pricing, areas] = await Promise.all([
    getBusinessSettings(),
    loadActiveServices(),
    loadActiveFaqs(),
    loadActivePricingRules(),
    loadActiveServiceAreas(),
  ]);

  const name = settings?.business_name || 'Precise Timing Transports';
  const phone = settings?.business_phone || 'Ask admin for phone number';
  const email = settings?.business_email || '';
  const bookingUrl = settings?.godaddy_booking_url || '';
  const extra = settings?.chatbot_system_prompt_extra || '';

  return `You are the friendly AI assistant for ${name}, a US moving and delivery business.

Your goals:
1. Answer customer questions clearly and professionally.
2. Help customers get price quotes by collecting: pickup address, dropoff address, move date, move size (studio/1BR/2BR/etc.), and any special items.
3. Help with booking questions. ${bookingUrl ? `When ready to book, share this GoDaddy booking link: ${bookingUrl}` : 'Booking link will be provided by the team — collect details for follow-up.'}
4. Capture lead info when the customer shows intent: name, phone, and email.

Business contact:
- Phone: ${phone}
${email ? `- Email: ${email}` : ''}
${settings?.website_url ? `- Website: ${settings.website_url}` : ''}
${settings?.address ? `- Address: ${settings.address}` : ''}

Services offered:
${formatServices(services)}

Service areas:
${formatAreas(areas)}

Pricing guidelines (use for estimates; mention final price may vary after details):
${formatPricing(pricing)}

FAQs:
${formatFaqs(faqs)}

Rules:
- Be concise, warm, and helpful. Use short paragraphs.
- Never invent prices outside the pricing guidelines above.
- If you cannot answer something, offer to have the team follow up and ask for phone/email.
- Do not mention OpenAI, APIs, or that you are an AI unless asked directly.
${extra ? `\nAdditional business instructions:\n${extra}` : ''}`.trim();
}
