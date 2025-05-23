import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, Wallet2, AlertOctagon, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/types/deal';
import Header from '@/components/Header';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserDeals();
    }
  }, [user]);

  const fetchUserDeals = async () => {
    setIsLoadingDeals(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('creator_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format deals to match the Deal type
      const formattedDeals = data.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        buyerEmail: deal.buyer_email,
        sellerEmail: deal.seller_email,
        status: deal.status,
        createdAt: deal.created_at,
        expiry: deal.expiry,
        deal_type: deal.deal_type,
        currency: deal.currency,
      }));

      setDeals(formattedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoadingDeals(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-800"><Wallet2 className="w-3 h-3" /> Paid</Badge>;
      case 'complete':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-800"><CheckCircle className="w-3 h-3" /> Complete</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800"><AlertOctagon className="w-3 h-3" /> Disputed</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-800"><CheckCircle className="w-3 h-3" /> Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-friendly-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">
            My Deals Dashboard
          </h1>
          <Button 
            onClick={() => navigate('/create-deal')} 
            className="bg-gradient-friendly hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Deal
          </Button>
        </div>

        {isLoadingDeals ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-friendly-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <Card className="p-8 text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-friendly-blue/30 dark:border-friendly-blue/60 rounded-xl shadow-lg">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2">No deals found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't created any deals yet. Get started by creating your first deal.
              </p>
              <Button 
                onClick={() => navigate('/create-deal')} 
                className="bg-gradient-friendly hover:opacity-90 transition-opacity"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Deal
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card 
                key={deal.id} 
                className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-friendly-blue/30 dark:border-friendly-blue/60 rounded-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg line-clamp-1 text-friendly-blue dark:text-blue-300">{deal.title}</h3>
                  {getStatusBadge(deal.status)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{deal.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-friendly-purple dark:text-purple-300">
                    {deal.currency || '$'}{deal.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Buyer:</span>
                    <span className="font-medium">{deal.buyerEmail}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Seller:</span>
                    <span className="font-medium">{deal.sellerEmail}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-friendly-blue/40 hover:border-friendly-blue/70 text-friendly-blue hover:text-friendly-blue hover:bg-friendly-blue/10 transition-colors"
                  onClick={() => navigate(`/deal/${deal.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Deal
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;