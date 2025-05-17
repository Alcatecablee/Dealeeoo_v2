-- Create token_audit_logs table
CREATE TABLE IF NOT EXISTS token_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_audit_logs_deal_id ON token_audit_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_token_audit_logs_user_email ON token_audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_token_audit_logs_created_at ON token_audit_logs(created_at);

-- Enable RLS
ALTER TABLE token_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" ON token_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'service_role');

-- Allow service role to read audit logs
CREATE POLICY "Service role can read audit logs" ON token_audit_logs
    FOR SELECT
    TO authenticated
    USING (auth.role() = 'service_role'); 