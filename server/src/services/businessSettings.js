import { z } from 'zod';
import { query } from '../lib/db.js';
import { T } from '../db/tables.js';

export const updateBusinessSettingsSchema = z.object({
  business_name: z.string().min(1).max(200).optional(),
  business_phone: z.string().max(50).nullable().optional(),
  business_email: z
    .union([z.string().email(), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),
  website_url: z
    .union([z.string().url(), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),
  address: z.string().max(500).nullable().optional(),
  timezone: z.string().max(80).optional(),
  godaddy_booking_url: z
    .union([z.string().url(), z.literal('')])
    .nullable()
    .optional()
    .transform((v) => v || null),
  chatbot_welcome_message: z.string().max(2000).nullable().optional(),
  chatbot_system_prompt_extra: z.string().max(8000).nullable().optional(),
});

const PUBLIC_FIELDS = [
  'business_name',
  'business_phone',
  'website_url',
  'timezone',
  'godaddy_booking_url',
  'chatbot_welcome_message',
];

export async function getBusinessSettings() {
  const { rows } = await query(
    `SELECT * FROM ${T.businessSettings} ORDER BY created_at ASC LIMIT 1`
  );
  return rows[0] || null;
}

export async function getPublicBusinessSettings() {
  const row = await getBusinessSettings();
  if (!row) return null;
  return Object.fromEntries(
    PUBLIC_FIELDS.filter((f) => row[f] != null).map((f) => [f, row[f]])
  );
}

export async function updateBusinessSettings(input) {
  const data = updateBusinessSettingsSchema.parse(input);
  const current = await getBusinessSettings();

  if (!current) {
    const { rows } = await query(
      `INSERT INTO ${T.businessSettings}
         (business_name, business_phone, business_email, website_url, address,
          timezone, godaddy_booking_url, chatbot_welcome_message, chatbot_system_prompt_extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.business_name ?? 'Precise Timing Transports',
        data.business_phone ?? null,
        data.business_email ?? null,
        data.website_url ?? null,
        data.address ?? null,
        data.timezone ?? 'America/New_York',
        data.godaddy_booking_url ?? null,
        data.chatbot_welcome_message ?? null,
        data.chatbot_system_prompt_extra ?? null,
      ]
    );
    return rows[0];
  }

  const merged = { ...current, ...data };
  const { rows } = await query(
    `UPDATE ${T.businessSettings}
     SET business_name = $1,
         business_phone = $2,
         business_email = $3,
         website_url = $4,
         address = $5,
         timezone = $6,
         godaddy_booking_url = $7,
         chatbot_welcome_message = $8,
         chatbot_system_prompt_extra = $9,
         updated_at = now()
     WHERE id = $10
     RETURNING *`,
    [
      merged.business_name,
      merged.business_phone,
      merged.business_email,
      merged.website_url,
      merged.address,
      merged.timezone,
      merged.godaddy_booking_url,
      merged.chatbot_welcome_message,
      merged.chatbot_system_prompt_extra,
      current.id,
    ]
  );
  return rows[0];
}
