import OpenAI from 'openai';
import { env } from '../config/env.js';

let openai;

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openai;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const EXTRACTION_PROMPT = `Extract lead and move details from this customer conversation for a moving/delivery business.

Return JSON only with this shape:
{
  "hasIntent": boolean,
  "intentType": "quote" | "booking" | "support" | "general",
  "confirmedBooking": boolean,
  "name": string | null,
  "phone": string | null,
  "email": string | null,
  "pickup_address": string | null,
  "dropoff_address": string | null,
  "move_date": "YYYY-MM-DD" | null,
  "move_size": string | null,
  "estimated_miles": number | null,
  "estimated_hours": number | null,
  "notes": string | null
}

Rules:
- hasIntent=true if customer wants a quote, booking, callback, or gave contact/move details.
- intentType=quote when asking for price/estimate.
- intentType=booking when asking to schedule.
- confirmedBooking=true only if the customer clearly booked or confirmed a job (said they booked, accepted a specific date/time, or confirmed they scheduled). Asking about booking is not enough.
- Only include fields explicitly mentioned or clearly implied.
- move_size examples: studio, 1BR, 2 bedroom, 3BR.
- Parse US phone numbers as digits with optional formatting.
- move_date must be ISO date if a date is mentioned, else null.`;

export async function extractLeadFromMessages(messages) {
  if (!messages.length) {
    return emptyExtraction();
  }

  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: transcript },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return emptyExtraction();

    const parsed = JSON.parse(raw);
    return normalizeExtraction(parsed);
  } catch (err) {
    console.warn('Lead extraction failed:', err.message);
    return emptyExtraction();
  }
}

function emptyExtraction() {
  return {
    hasIntent: false,
    intentType: 'general',
    confirmedBooking: false,
    name: null,
    phone: null,
    email: null,
    pickup_address: null,
    dropoff_address: null,
    move_date: null,
    move_size: null,
    estimated_miles: null,
    estimated_hours: null,
    notes: null,
  };
}

function normalizeExtraction(data) {
  const pick = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const num = (v) => (v != null && !Number.isNaN(Number(v)) ? Number(v) : null);

  return {
    hasIntent: Boolean(data.hasIntent),
    intentType: ['quote', 'booking', 'support', 'general'].includes(data.intentType)
      ? data.intentType
      : 'general',
    confirmedBooking: Boolean(data.confirmedBooking),
    name: pick(data.name),
    phone: pick(data.phone),
    email: pick(data.email),
    pickup_address: pick(data.pickup_address),
    dropoff_address: pick(data.dropoff_address),
    move_date: pick(data.move_date),
    move_size: pick(data.move_size),
    estimated_miles: num(data.estimated_miles),
    estimated_hours: num(data.estimated_hours),
    notes: pick(data.notes),
  };
}

export function shouldCaptureLead(extracted) {
  if (!extracted.hasIntent) return false;

  const hasContact = extracted.name || extracted.phone || extracted.email;
  const hasMoveDetails =
    extracted.pickup_address ||
    extracted.dropoff_address ||
    extracted.move_size ||
    extracted.move_date;

  return Boolean(hasContact || hasMoveDetails);
}

export function isConfirmedBooking(extracted) {
  return Boolean(extracted?.confirmedBooking);
}

export function canCalculateQuote(extracted) {
  return Boolean(
    extracted.pickup_address &&
      extracted.dropoff_address &&
      extracted.move_size &&
      (extracted.intentType === 'quote' || extracted.hasIntent)
  );
}
