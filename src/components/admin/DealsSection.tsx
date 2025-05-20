import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStatus } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, Search, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusOptions: DealStatus[] = ['pending', 'paid', 'complete'];

const DealsSection: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'buyerEmail' | 'sellerEmail'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [viewDealModal, setViewDealModal] = useState(false);

  useEffect(() => {
    // Only fetch on mount, not on filter change
    fetchDeals();
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:deals')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'deals' 
      }, (payload) => {
        fetchDeals();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDeals = async (overrideSearch?: string, overrideStatus?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('deals').select('*');
      const status = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const searchVal = overrideSearch !== undefined ? overrideSearch : search;
      if (status) {
        query = query.ilike('status', status);
      }
      if (searchVal) {
        query = query.or(`title.ilike.%${searchVal}%,description.ilike.%${searchVal}%,buyer_email.ilike.%${searchVal}%,seller_email.ilike.%${searchVal}%`);
      }
      query = query.order(
        sortBy === 'createdAt' ? 'created_at' : 
        sortBy === 'amount' ? 'amount' : 
        sortBy === 'buyerEmail' ? 'buyer_email' : 
        'seller_email', 
        { ascending: sortDir === 'asc' }
      );
      const { data, error } = await query;
      if (error) throw error;
      setDeals(data.map((deal: any) => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        buyerEmail: deal.buyer_email,
        sellerEmail: deal.seller_email,
        status: deal.status as DealStatus,
        createdAt: deal.created_at,
      })));
    } catch (error) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: DealStatus) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId);
      if (error) throw error;
      toast.success(`Deal status updated to ${newStatus}`);
    } catch (error) {
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

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search deals..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
            />
          </div>
          <select
            value={pendingStatusFilter}
            onChange={(e) => setPendingStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30 bg-background"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <Button
            className="bg-gradient-friendly text-white px-4 py-2 rounded font-semibold shadow hover:opacity-90 transition"
            onClick={() => {
              setSearch(pendingSearch);
              setStatusFilter(pendingStatusFilter);
              fetchDeals(pendingSearch, pendingStatusFilter);
            }}
          >
            Apply Filters
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => {
                      setSortBy('createdAt');
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => {
                      setSortBy('amount');
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    Amount
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Buyer</th>
                <th className="text-left py-3 px-4">Seller</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b border-border hover:bg-card/50">
                  <td className="py-3 px-4">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{deal.title}</td>
                  <td className="py-3 px-4">${deal.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{getStatusBadge(deal.status)}</td>
                  <td className="py-3 px-4">{deal.buyerEmail}</td>
                  <td className="py-3 px-4">{deal.sellerEmail}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setViewDealModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => updateDealStatus(deal.id, status)}
                              disabled={status === deal.status}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <Dialog open={viewDealModal} onOpenChange={setViewDealModal}>
        <DialogContent className="max-w-2xl" aria-describedby="deal-dialog-description">
          <DialogHeader>
            <DialogTitle>Deal Details</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                <p className="text-foreground">{selectedDeal.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-foreground">{selectedDeal.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount</h3>
                  <p className="text-2xl font-bold text-gradient-friendly">
                    ${selectedDeal.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  {getStatusBadge(selectedDeal.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Buyer</h3>
                  <p className="text-foreground">{selectedDeal.buyerEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Seller</h3>
                  <p className="text-foreground">{selectedDeal.sellerEmail}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <p className="text-foreground">
                  {new Date(selectedDeal.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DealsSection; 