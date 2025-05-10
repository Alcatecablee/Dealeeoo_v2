
import React from 'react';
import { Deal } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';
import dealService from '@/lib/api';

interface DealStatusProps {
  deal: Deal;
  onUpdate: () => void;
}

const DealStatus: React.FC<DealStatusProps> = ({ deal, onUpdate }) => {
  const handleUpdateStatus = async (newStatus: 'paid' | 'complete') => {
    try {
      await dealService.updateDealStatus(deal.id, newStatus);
      toast.success(`Deal marked as ${newStatus}`);
      onUpdate();
    } catch (error) {
      console.error(`Error updating deal status to ${newStatus}:`, error);
      toast.error("Failed to update deal status");
    }
  };

  const getStatusColor = () => {
    switch (deal.status) {
      case 'pending':
        return 'bg-dealStatus-pending';
      case 'paid':
        return 'bg-dealStatus-paid';
      case 'complete':
        return 'bg-dealStatus-complete';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (deal.status) {
      case 'pending':
        return <Clock className="mr-2" size={18} />;
      case 'paid':
        return <DollarSign className="mr-2" size={18} />;
      case 'complete':
        return <CheckCircle className="mr-2" size={18} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{deal.title}</CardTitle>
            <CardDescription>Deal ID: {deal.id}</CardDescription>
          </div>
          <Badge className={`${getStatusColor()} text-white px-3 py-1 text-sm uppercase`}>
            <span className="flex items-center">
              {getStatusIcon()}
              {deal.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-1">Description</h3>
            <p className="text-gray-900">{deal.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Amount</h3>
              <p className="text-lg font-semibold">${deal.amount.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Buyer</h3>
              <p className="text-gray-900">{deal.buyerEmail}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-1">Seller</h3>
              <p className="text-gray-900">{deal.sellerEmail}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-1">Created on</h3>
            <p className="text-gray-900">{new Date(deal.createdAt).toLocaleDateString()}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Deal Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deal.status === 'pending' || deal.status === 'paid' || deal.status === 'complete' ? 'bg-dealStatus-complete' : 'bg-gray-200'}`}>
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Created</span>
                </div>
                
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deal.status === 'paid' || deal.status === 'complete' ? 'bg-dealStatus-paid' : 'bg-gray-200'}`}>
                    <DollarSign className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Paid</span>
                </div>
                
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deal.status === 'complete' ? 'bg-dealStatus-complete' : 'bg-gray-200'}`}>
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Complete</span>
                </div>
              </div>
              
              <div className="absolute top-4 left-8 right-8 h-1 bg-gray-200">
                <div 
                  className={`h-full bg-dealStatus-complete`} 
                  style={{ 
                    width: deal.status === 'pending' ? '0%' : deal.status === 'paid' ? '50%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-4">
        {deal.status === 'pending' && (
          <Button onClick={() => handleUpdateStatus('paid')} variant="outline">
            Mark as Paid
          </Button>
        )}
        
        {deal.status === 'paid' && (
          <Button onClick={() => handleUpdateStatus('complete')} className="bg-dealStatus-complete hover:bg-green-600">
            Mark as Complete
          </Button>
        )}
        
        {deal.status === 'complete' && (
          <Button disabled>Deal Completed</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DealStatus;
