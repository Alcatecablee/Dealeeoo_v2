-- Create deal_status enum and deals table (initial migration)
CREATE TYPE deal_status AS ENUM ('pending', 'paid', 'complete');

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  buyer_email TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  status deal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  buyer_access_token TEXT,
  seller_access_token TEXT,
  buyer_token_expires_at TIMESTAMPTZ,
  seller_token_expires_at TIMESTAMPTZ,
  notes TEXT,
  expiry TIMESTAMPTZ,
  deal_type TEXT,
  currency TEXT,
  attachment_url TEXT,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);

-- Indexes for later use
CREATE INDEX IF NOT EXISTS idx_deals_disputed_at ON deals(disputed_at);
CREATE INDEX IF NOT EXISTS idx_deals_resolved_at ON deals(resolved_at); 