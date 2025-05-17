-- Add 'resolved' status to deal_status enum
ALTER TYPE deal_status ADD VALUE IF NOT EXISTS 'resolved';

-- Add columns for resolution
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolution_note TEXT;

-- Add an index for faster queries
CREATE INDEX IF NOT EXISTS idx_deals_resolved_at ON deals(resolved_at); 