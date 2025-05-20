import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ManualPaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const gateway = router.query.gateway || 'manual';
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Fetch deal info if needed (optional)

  const handleConfirmPaid = async () => {
    setLoading(true);
    // Call your API to mark as paid (simulate for now)
    await fetch(`/api/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ dealId: id, gateway }),
      headers: { 'Content-Type': 'application/json' }
    });
    setLoading(false);
    setConfirmed(true);
    // Optionally redirect or show a success message
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 px-4 py-12">
      <div className="max-w-lg w-full bg-gray-900/95 rounded-2xl shadow-2xl border border-blue-900/40 p-8">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Manual Payment Instructions</h1>
        <div className="mb-6 text-blue-200 text-center">
          <div className="mb-2">Deal ID: <span className="font-mono text-blue-400">{id}</span></div>
          <div className="mb-2">Selected Gateway: <span className="font-semibold text-purple-300">{gateway}</span></div>
        </div>
        <div className="mb-6 bg-blue-900/40 p-4 rounded-lg text-blue-100">
          <h2 className="font-semibold mb-2">How to Pay</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Send the payment using your preferred method (bank transfer, cash, etc.).</li>
            <li>Use the deal ID as your payment reference.</li>
            <li>Once you have paid, click the button below to notify the seller.</li>
          </ol>
        </div>
        {!confirmed ? (
          <Button onClick={handleConfirmPaid} className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-400 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            I Have Paid
          </Button>
        ) : (
          <div className="text-green-400 text-center font-bold mt-4">Thank you! The seller has been notified.</div>
        )}
      </div>
    </div>
  );
} 