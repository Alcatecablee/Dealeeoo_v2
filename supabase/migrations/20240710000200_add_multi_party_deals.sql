-- Multi-party deals support
CREATE TABLE deal_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- e.g. buyer, seller, observer, etc.
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(deal_id, email, role)
);

CREATE INDEX idx_deal_participants_deal_id ON deal_participants(deal_id);

ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage deal participants" ON deal_participants
    FOR ALL TO service_role USING (true) WITH CHECK (true); 