import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStatus } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get user email from localStorage or state management
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // Initial fetch
    fetchDeal();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`public:deals:id=eq.${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deals',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log('Change received:', payload);
        fetchDeal();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchDeal = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDeal({
        id: data.id,
        title: data.title,
        description: data.description,
        amount: data.amount,
        buyerEmail: data.buyer_email,
        sellerEmail: data.seller_email,
        status: data.status as DealStatus,
        createdAt: data.created_at
      });
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast.error('Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (newStatus: DealStatus) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Deal marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal status');
    }
  };

  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-dealStatus-pending text-white flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-dealStatus-paid text-white flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Paid
          </Badge>
        );
      case 'complete':
        return (
          <Badge className="bg-dealStatus-complete text-white flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Complete
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-card rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Deal not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isBuyer = userEmail === deal.buyerEmail;
  const isSeller = userEmail === deal.sellerEmail;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{deal.title}</CardTitle>
              {getStatusBadge(deal.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-foreground">{deal.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount</h3>
                  <p className="text-2xl font-bold text-gradient-friendly">${deal.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p className="text-foreground">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Buyer</h3>
                  <p className="text-foreground">{deal.buyerEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Seller</h3>
                  <p className="text-foreground">{deal.sellerEmail}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isBuyer && deal.status === 'pending' && (
          <Button
            className="w-full bg-gradient-friendly"
            onClick={() => updateDealStatus('paid')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Mark as Paid
          </Button>
        )}

        {isSeller && deal.status === 'paid' && (
          <Button
            className="w-full bg-gradient-friendly"
            onClick={() => updateDealStatus('complete')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default DealDetail;
