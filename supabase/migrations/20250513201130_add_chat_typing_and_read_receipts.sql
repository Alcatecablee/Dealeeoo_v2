-- Add read receipts to messages table
ALTER TABLE messages ADD COLUMN read_by jsonb DEFAULT '[]';

-- Create chat_typing table for typing indicators
CREATE TABLE chat_typing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  user_email text NOT NULL,
  is_typing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deal_id, user_email)
);
CREATE INDEX idx_chat_typing_deal_id ON chat_typing(deal_id); 