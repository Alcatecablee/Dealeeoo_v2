import { supabase } from '@/integrations/supabase/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { dealId, requestedBy, reason } = req.body;
  if (!dealId || !requestedBy || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { error } = await supabase.from('refund_requests').insert({
    deal_id: dealId,
    requested_by: requestedBy,
    reason,
  });
  if (error) {
    return res.status(500).json({ error: 'Failed to submit refund request' });
  }
  return res.status(200).json({ success: true });
} 