-- Create payment provider settings table
CREATE TABLE payment_provider_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    field TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, field)
);

-- Create active payment providers table
CREATE TABLE active_payment_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_payment_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage payment provider settings"
    ON payment_provider_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage active payment providers"
    ON active_payment_providers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_payment_provider_settings_provider ON payment_provider_settings(provider);
CREATE INDEX idx_active_payment_providers_provider ON active_payment_providers(provider); 