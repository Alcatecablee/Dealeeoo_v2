import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

  useEffect(() => {
    const storedKeys = localStorage.getItem('paymentApiKeys');
    const storedActive = localStorage.getItem('activePaymentProviders');
    if (storedKeys) setApiKeys(JSON.parse(storedKeys));
    if (storedActive) setActiveProviders(JSON.parse(storedActive));
  }, []);

  const handleKeyChange = (provider: string, field: string, value: string) => {
    const newKeys = {
      ...apiKeys,
      [provider]: {
        ...(apiKeys[provider] || {}),
        [field]: value,
      },
    };
    setApiKeys(newKeys);
    localStorage.setItem('paymentApiKeys', JSON.stringify(newKeys));
  };

  const handleToggleActive = (provider: string) => {
    let newActive: string[];
    if (activeProviders.includes(provider)) {
      newActive = activeProviders.filter((p) => p !== provider);
    } else {
      newActive = [...activeProviders, provider];
    }
    setActiveProviders(newActive);
    localStorage.setItem('activePaymentProviders', JSON.stringify(newActive));
  };

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
                    type="text"
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