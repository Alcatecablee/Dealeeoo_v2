import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const GATEWAYS = [
  { key: 'stripe', label: 'Stripe' },
  { key: 'wise', label: 'Wise' },
];

export default function PaymentGatewaysAdmin() {
  const [keys, setKeys] = useState({ stripe: '', wise: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current keys from backend
    fetch('/api/admin/payment-keys')
      .then(res => res.json())
      .then(data => setKeys(data))
      .catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    setKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    setError('');
    try {
      const res = await fetch('/api/admin/payment-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys),
      });
      if (!res.ok) throw new Error('Failed to save keys');
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 px-4 py-12">
      <div className="max-w-lg w-full bg-gray-900/95 rounded-2xl shadow-2xl border border-blue-900/40 p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Payment Gateway Settings</h1>
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {GATEWAYS.map(gw => (
            <div key={gw.key} className="mb-6">
              <label className="block text-blue-200 font-semibold mb-2">{gw.label} API Key</label>
              <input
                type="text"
                value={keys[gw.key] || ''}
                onChange={e => handleChange(gw.key, e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-blue-100 border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder={`Enter ${gw.label} API Key`}
              />
            </div>
          ))}
          <Button type="submit" className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-400 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          {success && <div className="text-green-400 text-center font-bold mt-4">Settings saved!</div>}
          {error && <div className="text-red-400 text-center font-bold mt-4">{error}</div>}
        </form>
      </div>
    </div>
  );
} 