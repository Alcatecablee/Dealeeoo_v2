-- Add new fields to deals table for enhanced deal creation
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS expiry TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deal_type TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT; 