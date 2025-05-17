-- Push notification tokens
CREATE TABLE push_notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    token TEXT NOT NULL,
    device_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_email, token)
);

CREATE INDEX idx_push_notification_tokens_user_email ON push_notification_tokens(user_email);

ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage push notification tokens" ON push_notification_tokens
    FOR ALL TO service_role USING (true) WITH CHECK (true); 