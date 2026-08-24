import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let client;

/**
 * Server-side Supabase client (service_role). Bypasses RLS — never expose to client/admin.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not set (use pg pool via lib/db.js instead).
 */
export function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function requireSupabase() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY missing in .env — add it from Supabase Dashboard → Project Settings → API'
    );
  }
  return sb;
}
