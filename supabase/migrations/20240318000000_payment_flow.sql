-- Create enum for deal status
CREATE TYPE deal_status AS ENUM (
  'PENDING',
  'PAID',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
  'REFUNDED'
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  status deal_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create deal tokens table
CREATE TABLE IF NOT EXISTS deal_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('BUYER', 'SELLER')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, user_email)
);

-- Create payment details table
CREATE TABLE IF NOT EXISTS payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  payment_proof TEXT,
  marked_paid_at TIMESTAMP WITH TIME ZONE,
  delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_role VARCHAR(10) NOT NULL CHECK (role IN ('BUYER', 'SELLER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  resolution VARCHAR(20) CHECK (resolution IN ('REFUND', 'COMPLETE')),
  created_by VARCHAR(255) NOT NULL,
  created_by_role VARCHAR(10) NOT NULL CHECK (created_by_role IN ('BUYER', 'SELLER')),
  resolved_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(deal_id)
);

-- Create dispute comments table
CREATE TABLE IF NOT EXISTS dispute_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_by_role VARCHAR(10) NOT NULL CHECK (created_by_role IN ('BUYER', 'SELLER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create admin tokens table
CREATE TABLE IF NOT EXISTS admin_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_deals_buyer_email ON deals(buyer_email);
CREATE INDEX idx_deals_seller_email ON deals(seller_email);
CREATE INDEX idx_deal_tokens_token ON deal_tokens(token);
CREATE INDEX idx_messages_deal_id ON messages(deal_id);
CREATE INDEX idx_disputes_deal_id ON disputes(deal_id);
CREATE INDEX idx_payment_details_deal_id ON payment_details(deal_id);

-- Add RLS policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_comments ENABLE ROW LEVEL SECURITY;

-- Deal access policy
CREATE POLICY deal_access_policy ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deal_tokens
      WHERE deal_tokens.deal_id = deals.id
      AND deal_tokens.token = current_setting('request.jwt.claims')::json->>'token'
    )
  );

-- Message access policy
CREATE POLICY message_access_policy ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deal_tokens
      WHERE deal_tokens.deal_id = messages.deal_id
      AND deal_tokens.token = current_setting('request.jwt.claims')::json->>'token'
    )
  );

-- Dispute access policy
CREATE POLICY dispute_access_policy ON disputes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deal_tokens
      WHERE deal_tokens.deal_id = disputes.deal_id
      AND deal_tokens.token = current_setting('request.jwt.claims')::json->>'token'
    )
  ); 