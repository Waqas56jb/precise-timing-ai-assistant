import { query } from '../lib/db.js';
import { T } from '../db/tables.js';

export async function getLeadByConversationId(conversationId) {
  const { rows } = await query(
    `SELECT * FROM ${T.leads} WHERE conversation_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [conversationId]
  );
  return rows[0] || null;
}

export async function getLeadById(id) {
  const { rows } = await query(`SELECT * FROM ${T.leads} WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function listLeads({ limit = 50, status = null } = {}) {
  let sql = `SELECT * FROM ${T.leads}`;
  const params = [];
  if (status) {
    sql += ` WHERE status = $1`;
    params.push(status);
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const { rows } = await query(sql, params);
  return rows;
}

function mergeField(existing, incoming) {
  return incoming != null && incoming !== '' ? incoming : existing;
}

export async function upsertLeadFromExtraction({
  conversationId,
  extracted,
  source = 'website',
}) {
  const existing = await getLeadByConversationId(conversationId);

  const fields = {
    name: extracted.name,
    phone: extracted.phone,
    email: extracted.email,
    pickup_address: extracted.pickup_address,
    dropoff_address: extracted.dropoff_address,
    move_date: extracted.move_date,
    move_size: extracted.move_size,
    notes: extracted.notes,
  };

  let lead;

  if (existing) {
    const { rows } = await query(
      `UPDATE ${T.leads}
       SET name = $1,
           phone = $2,
           email = $3,
           pickup_address = $4,
           dropoff_address = $5,
           move_date = $6,
           move_size = $7,
           notes = $8,
           metadata = metadata || $9::jsonb,
           updated_at = now()
       WHERE id = $10
       RETURNING *`,
      [
        mergeField(existing.name, fields.name),
        mergeField(existing.phone, fields.phone),
        mergeField(existing.email, fields.email),
        mergeField(existing.pickup_address, fields.pickup_address),
        mergeField(existing.dropoff_address, fields.dropoff_address),
        mergeField(existing.move_date, fields.move_date),
        mergeField(existing.move_size, fields.move_size),
        mergeField(existing.notes, fields.notes),
        JSON.stringify({
          intentType: extracted.intentType,
          estimated_miles: extracted.estimated_miles,
          estimated_hours: extracted.estimated_hours,
        }),
        existing.id,
      ]
    );
    lead = rows[0];
  } else {
    const { rows } = await query(
      `INSERT INTO ${T.leads}
         (name, phone, email, pickup_address, dropoff_address, move_date, move_size,
          notes, source, status, conversation_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10, $11)
       RETURNING *`,
      [
        fields.name,
        fields.phone,
        fields.email,
        fields.pickup_address,
        fields.dropoff_address,
        fields.move_date,
        fields.move_size,
        fields.notes,
        source,
        conversationId,
        JSON.stringify({
          intentType: extracted.intentType,
          estimated_miles: extracted.estimated_miles,
          estimated_hours: extracted.estimated_hours,
        }),
      ]
    );
    lead = rows[0];
  }

  await query(
    `UPDATE ${T.conversations} SET lead_id = $1, updated_at = now() WHERE id = $2`,
    [lead.id, conversationId]
  );

  return lead;
}
