import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal, DealStatus } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, DollarSign, ArrowRight, Search, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AnimatedSection from './AnimatedSection';
import { toast } from 'sonner';
import ColorfulShapes from './ColorfulShapes';

const DealsDashboard: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    fetchDeals();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:deals')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'deals' 
      }, (payload) => {
        console.log('Change received:', payload);
        fetchDeals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform DB format to app format with proper type casting
      const formattedDeals: Deal[] = data.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        buyerEmail: deal.buyer_email,
        sellerEmail: deal.seller_email,
        status: deal.status as DealStatus,
        createdAt: deal.created_at
      }));
      
      setDeals(formattedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
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

  const handleCreateDeal = () => {
    navigate('/create-deal');
  };

  const handleViewDeal = (dealId: string) => {
    navigate(`/deal/${dealId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-friendly-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient-friendly">Your Deals</h2>
        <Button 
          onClick={handleCreateDeal}
          className="bg-gradient-to-r from-friendly-blue to-friendly-purple text-white hover:opacity-90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-friendly-blue/20">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gradient-friendly mb-2">No Deals Yet</h3>
            <p className="text-gray-600 mb-6">Create your first deal to get started with secure peer-to-peer transactions.</p>
            <Button 
              onClick={handleCreateDeal}
              className="bg-gradient-to-r from-friendly-blue to-friendly-purple text-white hover:opacity-90"
            >
              Create Your First Deal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <AnimatedSection key={deal.id} delay={index * 100} className="h-full">
              <Card className="h-full border-2 border-friendly-blue/20 hover:border-friendly-blue/40 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewDeal(deal.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gradient-friendly line-clamp-1">{deal.title}</CardTitle>
                    {getStatusBadge(deal.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created: {new Date(deal.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{deal.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gradient-friendly">${deal.amount.toFixed(2)}</span>
                    <Button variant="ghost" size="sm" className="text-friendly-blue hover:text-friendly-purple">
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsDashboard;
