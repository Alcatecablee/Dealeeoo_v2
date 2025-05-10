
import { Deal, CreateDealInput, DealStatus } from '@/types/deal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

class DealService {
  async createDeal(dealInput: CreateDealInput): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        title: dealInput.title,
        description: dealInput.description,
        amount: dealInput.amount,
        buyer_email: dealInput.buyerEmail,
        seller_email: dealInput.sellerEmail,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating deal:', error);
      throw new Error(error.message);
    }
    
    // Transform from database format to application format
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      amount: data.amount,
      buyerEmail: data.buyer_email,
      sellerEmail: data.seller_email,
      status: data.status as DealStatus,
      createdAt: data.created_at
    };
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching deal:', error);
      throw new Error(error.message);
    }
    
    if (!data) return undefined;
    
    // Transform from database format to application format
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      amount: data.amount,
      buyerEmail: data.buyer_email,
      sellerEmail: data.seller_email,
      status: data.status as DealStatus,
      createdAt: data.created_at
    };
  }

  async updateDealStatus(id: string, status: DealStatus): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating deal:', error);
      throw new Error(error.message);
    }
    
    // Transform from database format to application format
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      amount: data.amount,
      buyerEmail: data.buyer_email,
      sellerEmail: data.seller_email,
      status: data.status as DealStatus,
      createdAt: data.created_at
    };
  }

  async getAllDeals(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching deals:', error);
      throw new Error(error.message);
    }
    
    // Transform from database format to application format
    return data.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      amount: deal.amount,
      buyerEmail: deal.buyer_email,
      sellerEmail: deal.seller_email,
      status: deal.status as DealStatus,
      createdAt: deal.created_at
    }));
  }
}

// Singleton instance
const dealService = new DealService();

export default dealService;
