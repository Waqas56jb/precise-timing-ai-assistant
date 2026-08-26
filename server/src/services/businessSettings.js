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
  appearance_json: z.record(z.any()).optional(),
});

const PUBLIC_FIELDS = [
  'business_name',
  'business_phone',
  'website_url',
  'timezone',
  'godaddy_booking_url',
  'chatbot_welcome_message',
  'appearance_json',
];

export async function getBusinessSettings() {
  const { rows } = await query(
    `SELECT * FROM ${T.businessSettings} ORDER BY created_at ASC LIMIT 1`
  );
  const row = rows[0] || null;
  if (!row) return null;
  if (typeof row.appearance_json === 'string') {
    try {
      row.appearance_json = JSON.parse(row.appearance_json);
    } catch {
      row.appearance_json = {};
    }
  }
  row.appearance_json = row.appearance_json || {};
  return row;
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
          timezone, godaddy_booking_url, chatbot_welcome_message,
          chatbot_system_prompt_extra, appearance_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
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
        JSON.stringify(data.appearance_json || {}),
      ]
    );
    return rows[0];
  }

  const merged = { ...current, ...data };
  const appearance =
    data.appearance_json != null
      ? { ...(current.appearance_json || {}), ...data.appearance_json }
      : current.appearance_json;
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
         appearance_json = $10::jsonb,
         updated_at = now()
     WHERE id = $11
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
      JSON.stringify(appearance || {}),
      current.id,
    ]
  );
  return rows[0];
}
