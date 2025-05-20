-- Add disputed status to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Update the status enum to include 'disputed'
ALTER TYPE deal_status ADD VALUE IF NOT EXISTS 'disputed';

-- Add an index for faster dispute queries
CREATE INDEX IF NOT EXISTS idx_deals_disputed_at ON deals(disputed_at);

-- Add a trigger to automatically set disputed_at when status changes to disputed
CREATE OR REPLACE FUNCTION set_disputed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'disputed' AND OLD.status != 'disputed' THEN
    NEW.disputed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_disputed_at_trigger ON deals;
CREATE TRIGGER set_disputed_at_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION set_disputed_at(); 