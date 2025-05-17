import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DisputeDeal {
  id: string;
  title: string;
  buyerEmail: string;
  sellerEmail: string;
  dispute_reason: string | null;
  disputed_at: string | null;
  status: string;
  disputeReason: string | null;
  resolutionNote: string | null;
}

const DisputesAdmin: React.FC = () => {
  const [deals, setDeals] = useState<DisputeDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:deals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deals',
      }, (payload) => {
        fetchDisputes();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, buyer_email, seller_email, dispute_reason, disputed_at, status, resolution_note')
        .eq('status', 'disputed')
        .order('disputed_at', { ascending: false });
      if (error) throw error;
      setDeals((data || []).map((deal: any) => ({
        ...deal,
        buyerEmail: deal.buyer_email,
        sellerEmail: deal.seller_email,
        disputeReason: deal.dispute_reason ?? null,
        resolutionNote: deal.resolution_note ?? null,
      })));
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Disputed Deals</h1>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center text-muted-foreground">No disputes found.</div>
      ) : (
        <div className="space-y-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="border-red-400/40">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg mb-1">{deal.title}</div>
                    <div className="text-sm text-muted-foreground mb-1">Deal ID: <span className="font-mono">{deal.id}</span></div>
                    <div className="text-sm mb-1">Buyer: <span className="font-mono">{deal.buyerEmail}</span></div>
                    <div className="text-sm mb-1">Seller: <span className="font-mono">{deal.sellerEmail}</span></div>
                    <div className="text-sm text-red-600 font-medium mt-2">Reason: {deal.disputeReason || <span className="italic text-muted-foreground">No reason provided</span>}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <a href={`/deal/${deal.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">View Deal</Button>
                    </a>
                    <div className="text-xs text-muted-foreground">Filed: {deal.disputed_at ? new Date(deal.disputed_at).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputesAdmin; 