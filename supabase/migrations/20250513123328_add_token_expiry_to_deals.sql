-- Add token expiry fields to deals table
ALTER TABLE deals
ADD COLUMN buyer_token_expires_at TIMESTAMPTZ,
ADD COLUMN seller_token_expires_at TIMESTAMPTZ;
