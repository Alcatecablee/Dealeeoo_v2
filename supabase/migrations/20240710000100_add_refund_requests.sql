-- Refund requests table
CREATE TABLE refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    requested_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_deal_id ON refund_requests(deal_id);

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage refund requests" ON refund_requests
    FOR ALL TO service_role USING (true) WITH CHECK (true); 