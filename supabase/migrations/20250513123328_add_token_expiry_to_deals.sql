-- Add token expiry fields to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS buyer_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seller_token_expires_at TIMESTAMPTZ;
