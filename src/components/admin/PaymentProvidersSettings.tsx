import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { encrypt, decrypt } from '@/lib/encryption';

const PROVIDERS = [
  {
    key: 'stripe',
    label: 'Stripe',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key' },
      { key: 'secretKey', label: 'Secret Key' },
      { key: 'webhookSecret', label: 'Webhook Secret' },
    ],
  },
  {
    key: 'paystack',
    label: 'Paystack',
    fields: [
      { key: 'publicKey', label: 'Public Key' },
      { key: 'secretKey', label: 'Secret Key' },
      { key: 'webhookSecret', label: 'Webhook Secret' },
    ],
  },
  {
    key: 'flutterwave',
    label: 'Flutterwave',
    fields: [
      { key: 'publicKey', label: 'Public Key' },
      { key: 'secretKey', label: 'Secret Key' },
      { key: 'encryptionKey', label: 'Encryption Key' },
      { key: 'webhookSecret', label: 'Webhook Secret' },
    ],
  },
];

const PaymentProvidersSettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<{ [provider: string]: { [field: string]: string } }>({});
  const [activeProviders, setActiveProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch encrypted API keys
      const { data: keysData, error: keysError } = await supabase
        .from('payment_provider_settings')
        .select('*');

      if (keysError) throw keysError;

      // Decrypt and set API keys
      const decryptedKeys: { [provider: string]: { [field: string]: string } } = {};
      keysData?.forEach((setting) => {
        if (!decryptedKeys[setting.provider]) {
          decryptedKeys[setting.provider] = {};
        }
        decryptedKeys[setting.provider][setting.field] = decrypt(setting.encrypted_value);
      });
      setApiKeys(decryptedKeys);

      // Fetch active providers
      const { data: activeData, error: activeError } = await supabase
        .from('active_payment_providers')
        .select('provider');

      if (activeError) throw activeError;

      setActiveProviders(activeData?.map(p => p.provider) || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load payment provider settings');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyChange = async (provider: string, field: string, value: string) => {
    try {
      // Encrypt the value
      const encryptedValue = encrypt(value);

      // Update in database
      const { error } = await supabase
        .from('payment_provider_settings')
        .upsert({
          provider,
          field,
          encrypted_value: encryptedValue,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setApiKeys(prev => ({
        ...prev,
        [provider]: {
          ...(prev[provider] || {}),
          [field]: value,
        },
      }));

      toast.success(`${provider} ${field} updated successfully`);
    } catch (error) {
      console.error('Error updating key:', error);
      toast.error('Failed to update API key');
    }
  };

  const handleToggleActive = async (provider: string) => {
    try {
      let newActive: string[];
      if (activeProviders.includes(provider)) {
        newActive = activeProviders.filter((p) => p !== provider);
        // Remove from database
        const { error } = await supabase
          .from('active_payment_providers')
          .delete()
          .eq('provider', provider);

        if (error) throw error;
      } else {
        newActive = [...activeProviders, provider];
        // Add to database
        const { error } = await supabase
          .from('active_payment_providers')
          .insert({ provider });

        if (error) throw error;
      }

      setActiveProviders(newActive);
      toast.success(`${provider} ${newActive.includes(provider) ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast.error('Failed to update provider status');
    }
  };

  if (loading) {
    return <div>Loading payment provider settings...</div>;
  }

  return (
    <div className="space-y-6">
      {PROVIDERS.map((p) => (
        <Card key={p.key} className="p-4 border border-border">
          <CardContent className="flex flex-col gap-4">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeProviders.includes(p.key)}
                onChange={() => handleToggleActive(p.key)}
                className="accent-primary h-4 w-4"
                id={`provider-${p.key}`}
              />
              <label htmlFor={`provider-${p.key}`}>{p.label}</label>
              {activeProviders.includes(p.key) && <span className="text-xs text-green-500 font-semibold ml-2">Active</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.fields.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-sm font-medium mb-1" htmlFor={`${p.key}-${field.key}`}>{field.label}</label>
                  <Input
                    id={`${p.key}-${field.key}`}
                    type="password"
                    placeholder={`Enter ${p.label} ${field.label}`}
                    value={apiKeys[p.key]?.[field.key] || ''}
                    onChange={e => handleKeyChange(p.key, field.key, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="mt-4 text-sm text-muted-foreground">
        <b>Active Providers:</b> {activeProviders.length > 0 ? activeProviders.map(p => PROVIDERS.find(x => x.key === p)?.label).join(', ') : 'None'}
      </div>
    </div>
  );
};

export default PaymentProvidersSettings; 