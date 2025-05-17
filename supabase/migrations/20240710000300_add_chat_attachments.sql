-- File attachments for chat
CREATE TABLE chat_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    message_id UUID,
    uploaded_by TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_attachments_deal_id ON chat_attachments(deal_id);
CREATE INDEX idx_chat_attachments_message_id ON chat_attachments(message_id);

ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage chat attachments" ON chat_attachments
    FOR ALL TO service_role USING (true) WITH CHECK (true); 