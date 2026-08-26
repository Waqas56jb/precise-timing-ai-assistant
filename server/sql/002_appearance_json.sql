-- Safe additive columns for admin theme + copy overrides
ALTER TABLE precise_timing_ai_assistant_business_settings
  ADD COLUMN IF NOT EXISTS appearance_json JSONB NOT NULL DEFAULT '{}'::jsonb;
