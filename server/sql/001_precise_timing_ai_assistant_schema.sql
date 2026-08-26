-- Precise Timing AI Assistant schema
-- SAFE: CREATE TABLE IF NOT EXISTS only — never DROP / TRUNCATE / ALTER existing projects.
-- Prefix: precise_timing_ai_assistant_*

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin users (app-level; auth can use Supabase Auth later)
CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'Precise Timing Transports',
  business_phone TEXT,
  business_email TEXT,
  website_url TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  godaddy_booking_url TEXT,
  chatbot_welcome_message TEXT,
  chatbot_system_prompt_extra TEXT,
  appearance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_id UUID REFERENCES precise_timing_ai_assistant_services(id) ON DELETE SET NULL,
  move_size TEXT,
  base_price NUMERIC(12, 2),
  price_per_mile NUMERIC(12, 2),
  price_per_hour NUMERIC(12, 2),
  min_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  rules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_codes TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  move_date DATE,
  move_size TEXT,
  notes TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  conversation_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'website',
  visitor_id TEXT,
  lead_id UUID REFERENCES precise_timing_ai_assistant_leads(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional FK from leads → conversations (after both exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'precise_timing_ai_assistant_leads_conversation_id_fkey'
  ) THEN
    ALTER TABLE precise_timing_ai_assistant_leads
      ADD CONSTRAINT precise_timing_ai_assistant_leads_conversation_id_fkey
      FOREIGN KEY (conversation_id)
      REFERENCES precise_timing_ai_assistant_conversations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES precise_timing_ai_assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tokens_used INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES precise_timing_ai_assistant_leads(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES precise_timing_ai_assistant_conversations(id) ON DELETE SET NULL,
  quote_number TEXT,
  amount NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  pricing_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_until DATE,
  emailed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES precise_timing_ai_assistant_leads(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES precise_timing_ai_assistant_quotes(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES precise_timing_ai_assistant_conversations(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  pickup_address TEXT,
  dropoff_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  godaddy_booking_url TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precise_timing_ai_assistant_integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  realm_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_type TEXT,
  expires_at TIMESTAMPTZ,
  refresh_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, environment, realm_id)
);

CREATE INDEX IF NOT EXISTS idx_ptai_leads_status
  ON precise_timing_ai_assistant_leads (status);
CREATE INDEX IF NOT EXISTS idx_ptai_leads_source
  ON precise_timing_ai_assistant_leads (source);
CREATE INDEX IF NOT EXISTS idx_ptai_messages_conversation
  ON precise_timing_ai_assistant_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ptai_conversations_status
  ON precise_timing_ai_assistant_conversations (status);
CREATE INDEX IF NOT EXISTS idx_ptai_quotes_lead
  ON precise_timing_ai_assistant_quotes (lead_id);
CREATE INDEX IF NOT EXISTS idx_ptai_bookings_lead
  ON precise_timing_ai_assistant_bookings (lead_id);
CREATE INDEX IF NOT EXISTS idx_ptai_integration_provider
  ON precise_timing_ai_assistant_integration_tokens (provider, environment);

-- Seed one business_settings row only if empty (no overwrite of existing row content)
INSERT INTO precise_timing_ai_assistant_business_settings (business_name)
SELECT 'Precise Timing Transports'
WHERE NOT EXISTS (SELECT 1 FROM precise_timing_ai_assistant_business_settings LIMIT 1);
