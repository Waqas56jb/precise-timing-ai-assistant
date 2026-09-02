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

export async function listLeads({
  limit = 50,
  offset = 0,
  status = null,
  source = null,
  q = null,
} = {}) {
  const clauses = [];
  const params = [];

  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (source) {
    if (source === 'chatbot') {
      params.push('chatbot', 'website');
      clauses.push(`source IN ($${params.length - 1}, $${params.length})`);
    } else {
      params.push(source);
      clauses.push(`source = $${params.length}`);
    }
  }
  if (q && String(q).trim()) {
    params.push(`%${String(q).trim()}%`);
    const i = params.length;
    clauses.push(
      `(COALESCE(name,'') ILIKE $${i} OR COALESCE(email,'') ILIKE $${i} OR COALESCE(phone,'') ILIKE $${i} OR COALESCE(notes,'') ILIKE $${i} OR COALESCE(pickup_address,'') ILIKE $${i})`
    );
  }

  let sql = `SELECT * FROM ${T.leads}`;
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Math.min(Number(limit) || 50, 200), Number(offset) || 0);

  const { rows } = await query(sql, params);
  return rows;
}

export async function countLeads({ status = null, source = null, q = null } = {}) {
  const clauses = [];
  const params = [];
  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (source) {
    if (source === 'chatbot') {
      params.push('chatbot', 'website');
      clauses.push(`source IN ($${params.length - 1}, $${params.length})`);
    } else {
      params.push(source);
      clauses.push(`source = $${params.length}`);
    }
  }
  if (q && String(q).trim()) {
    params.push(`%${String(q).trim()}%`);
    const i = params.length;
    clauses.push(
      `(COALESCE(name,'') ILIKE $${i} OR COALESCE(email,'') ILIKE $${i} OR COALESCE(phone,'') ILIKE $${i} OR COALESCE(notes,'') ILIKE $${i})`
    );
  }
  let sql = `SELECT COUNT(*)::int AS n FROM ${T.leads}`;
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  const { rows } = await query(sql, params);
  return rows[0]?.n || 0;
}

export async function getLeadStats() {
  const [bySource, byStatus, recent] = await Promise.all([
    query(
      `SELECT COALESCE(source, 'unknown') AS source, COUNT(*)::int AS count
       FROM ${T.leads} GROUP BY 1 ORDER BY count DESC`
    ),
    query(
      `SELECT COALESCE(status, 'new') AS status, COUNT(*)::int AS count
       FROM ${T.leads} GROUP BY 1 ORDER BY count DESC`
    ),
    query(
      `SELECT COUNT(*)::int AS n FROM ${T.leads}
       WHERE created_at >= now() - interval '7 days'`
    ),
  ]);

  const sources = Object.fromEntries(bySource.rows.map((r) => [r.source, r.count]));
  const chatbot = (sources.chatbot || 0) + (sources.website || 0);

  return {
    total: bySource.rows.reduce((s, r) => s + r.count, 0),
    last7Days: recent.rows[0]?.n || 0,
    bySource: {
      ...sources,
      chatbot,
    },
    byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, r.count])),
  };
}

export async function updateLead(id, patch = {}) {
  const current = await getLeadById(id);
  if (!current) return null;

  if (patch.status) {
    const allowed = ['new', 'contacted', 'quoted', 'booked', 'closed', 'archived'];
    if (!allowed.includes(patch.status)) {
      const err = new Error(`Invalid status. Use: ${allowed.join(', ')}`);
      err.status = 400;
      throw err;
    }
  }

  const meta = { ...(current.metadata && typeof current.metadata === 'object' ? current.metadata : {}) };
  if (patch.blocked === true) meta.blocked = true;
  if (patch.blocked === false) meta.blocked = false;

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
         status = $9,
         metadata = $10::jsonb,
         updated_at = now()
     WHERE id = $11
     RETURNING *`,
    [
      patch.name !== undefined ? patch.name : current.name,
      patch.phone !== undefined ? patch.phone : current.phone,
      patch.email !== undefined ? patch.email : current.email,
      patch.pickup_address !== undefined ? patch.pickup_address : current.pickup_address,
      patch.dropoff_address !== undefined ? patch.dropoff_address : current.dropoff_address,
      patch.move_date !== undefined ? patch.move_date : current.move_date,
      patch.move_size !== undefined ? patch.move_size : current.move_size,
      patch.notes !== undefined ? patch.notes : current.notes,
      patch.status !== undefined ? patch.status : current.status,
      JSON.stringify(meta),
      id,
    ]
  );
  return rows[0] || null;
}

export async function deleteLead(id) {
  const { rowCount } = await query(`DELETE FROM ${T.leads} WHERE id = $1`, [id]);
  return rowCount > 0;
}

export async function getLeadAnalytics() {
  const [daily, quoted, booked] = await Promise.all([
    query(
      `SELECT to_char(created_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS day,
              COUNT(*)::int AS count
       FROM ${T.leads}
       WHERE created_at >= now() - interval '14 days'
       GROUP BY 1
       ORDER BY 1`
    ),
    query(`SELECT COUNT(*)::int AS n FROM ${T.quotes}`),
    query(`SELECT COUNT(*)::int AS n FROM ${T.leads} WHERE status = 'booked'`),
  ]);
  return {
    daily: daily.rows,
    quotes: quoted.rows[0]?.n || 0,
    booked: booked.rows[0]?.n || 0,
  };
}

export async function getLeadQuotes(leadId) {
  const { rows } = await query(
    `SELECT * FROM ${T.quotes} WHERE lead_id = $1 ORDER BY created_at DESC`,
    [leadId]
  );
  return rows;
}

/** Dedup key for Thumbtack / Yelp / Zapier ingest. */
export async function getLeadByExternalId(source, externalId) {
  if (!source || !externalId) return null;
  const { rows } = await query(
    `SELECT * FROM ${T.leads}
     WHERE source = $1 AND metadata->>'external_id' = $2
     ORDER BY updated_at DESC
     LIMIT 1`,
    [source, String(externalId)]
  );
  return rows[0] || null;
}

/**
 * Create or update a lead from an external channel (thumbtack, yelp, email, zapier).
 * Dedupes on (source + metadata.external_id) when externalId is provided.
 */
export async function upsertExternalLead({
  source,
  externalId = null,
  name = null,
  phone = null,
  email = null,
  pickup_address = null,
  dropoff_address = null,
  move_date = null,
  move_size = null,
  notes = null,
  status = 'new',
  metadata = {},
}) {
  if (!source) throw new Error('source is required');

  const meta = {
    ...metadata,
    ...(externalId != null ? { external_id: String(externalId) } : {}),
  };

  const existing = externalId ? await getLeadByExternalId(source, externalId) : null;

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
        mergeField(existing.name, name),
        mergeField(existing.phone, phone),
        mergeField(existing.email, email),
        mergeField(existing.pickup_address, pickup_address),
        mergeField(existing.dropoff_address, dropoff_address),
        mergeField(existing.move_date, move_date),
        mergeField(existing.move_size, move_size),
        mergeField(existing.notes, notes),
        JSON.stringify(meta),
        existing.id,
      ]
    );
    return { lead: rows[0], created: false };
  }

  const { rows } = await query(
    `INSERT INTO ${T.leads}
       (name, phone, email, pickup_address, dropoff_address, move_date, move_size,
        notes, source, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
     RETURNING *`,
    [
      name,
      phone,
      email,
      pickup_address,
      dropoff_address,
      move_date,
      move_size,
      notes,
      source,
      status || 'new',
      JSON.stringify(meta),
    ]
  );

  return { lead: rows[0], created: true };
}

function mergeField(existing, incoming) {
  return incoming != null && incoming !== '' ? incoming : existing;
}

/** Merge keys into lead.metadata without replacing the rest of the object. */
export async function mergeLeadMetadata(leadId, patch = {}) {
  await query(
    `UPDATE ${T.leads}
     SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb, updated_at = now()
     WHERE id = $2`,
    [JSON.stringify(patch), leadId]
  );
}

/** Link a chat transcript to an inbound marketplace lead. */
export async function attachConversationToLead(leadId, conversationId) {
  await query(
    `UPDATE ${T.leads}
     SET conversation_id = $1, updated_at = now()
     WHERE id = $2`,
    [conversationId, leadId]
  );
  await query(
    `UPDATE ${T.conversations}
     SET lead_id = $1, updated_at = now()
     WHERE id = $2`,
    [leadId, conversationId]
  );
}

/** Remember which lead snapshot was last emailed so we don't notify twice. */
export async function markLeadNotified(leadId, fingerprint) {
  await mergeLeadMetadata(leadId, {
    notify_fingerprint: fingerprint,
    notified_at: new Date().toISOString(),
  });
}

export async function upsertLeadFromExtraction({
  conversationId,
  extracted,
  source = 'chatbot',
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

export async function markLeadBooked(leadId, extra = {}) {
  const current = await getLeadById(leadId);
  if (!current) return null;

  const { rows } = await query(
    `UPDATE ${T.leads}
     SET status = 'booked',
         metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
         updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [
      JSON.stringify({
        booked_at: current.metadata?.booked_at || new Date().toISOString(),
        ...extra,
      }),
      leadId,
    ]
  );
  return rows[0] || current;
}

export async function createBookingRecord({
  leadId,
  conversationId = null,
  quoteId = null,
  pickupAddress = null,
  dropoffAddress = null,
  notes = null,
} = {}) {
  if (!leadId) return null;
  const existing = await query(
    `SELECT id FROM ${T.bookings} WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [leadId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const { rows } = await query(
    `INSERT INTO ${T.bookings}
       (lead_id, conversation_id, quote_id, pickup_address, dropoff_address, status, notes)
     VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
     RETURNING *`,
    [leadId, conversationId, quoteId, pickupAddress, dropoffAddress, notes]
  );
  return rows[0] || null;
}
