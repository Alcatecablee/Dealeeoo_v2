import { Deal, CreateDealInput, DealStatus } from '@/types/deal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

class DealService {
  async createDeal(dealInput: CreateDealInput): Promise<Deal> {
    // Set expiry to 7 days from now if not provided
    let expiryISO = dealInput.expiry;
    if (!expiryISO) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in ms
      expiryISO = expiry.toISOString();
    }
    
    // Create the deal data object
    const dealData: any = {
      title: dealInput.title,
      description: dealInput.description,
      amount: dealInput.amount,
      buyer_email: dealInput.buyerEmail,
      seller_email: dealInput.sellerEmail,
      status: 'pending',
      buyer_access_token: dealInput.buyer_access_token,
      seller_access_token: dealInput.seller_access_token,
      buyer_token_expires_at: expiryISO,
      seller_token_expires_at: expiryISO,
      notes: dealInput.notes || null,
      expiry: expiryISO,
      deal_type: dealInput.deal_type || null,
      currency: dealInput.currency || null,
      attachment_url: dealInput.attachment_url || null,
    };
    
    // Add creator_user_id if provided
    if (dealInput.creator_user_id) {
      dealData.creator_user_id = dealInput.creator_user_id;
    }
    
    // Add guest_id if provided
    if (dealInput.guest_id) {
      dealData.guest_id = dealInput.guest_id;
    }
    
    const { data, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select()
      .single();
      
    if (error) {
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
      createdAt: data.created_at,
      notes: data.notes,
      expiry: data.expiry,
      deal_type: data.deal_type,
      currency: data.currency,
      attachment_url: data.attachment_url,
    };
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
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

  async updateDealStatus(id: string, status: DealStatus, triggeredByEmail?: string): Promise<Deal | undefined> {
    const { data, error } = await supabase
      .from('deals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    // Send notifications to both parties (except the one who triggered)
    if (data) {
      const buyerEmail = data.buyer_email;
      const sellerEmail = data.seller_email;
      const statusMsg = {
        paid: 'Deal marked as paid.',
        complete: 'Deal marked as complete.',
        disputed: 'A dispute has been filed on your deal.',
        resolved: 'A dispute has been resolved.',
        pending: 'Deal status set to pending.'
      }[status] || `Deal status updated to ${status}`;
      if (buyerEmail && buyerEmail !== triggeredByEmail) {
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('enabled')
          .eq('user_email', buyerEmail)
          .eq('type', 'deal_status')
          .single();
        if (!prefs || prefs.enabled !== false) {
          await supabase.from('notifications').insert({
            user_email: buyerEmail,
            type: 'deal_status',
            message: statusMsg,
            deal_id: id,
            link: `/deal/${id}`
          });
        }
      }
      if (sellerEmail && sellerEmail !== triggeredByEmail) {
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('enabled')
          .eq('user_email', sellerEmail)
          .eq('type', 'deal_status')
          .single();
        if (!prefs || prefs.enabled !== false) {
          await supabase.from('notifications').insert({
            user_email: sellerEmail,
            type: 'deal_status',
            message: statusMsg,
            deal_id: id,
            link: `/deal/${id}`
          });
        }
      }
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

  async addParticipant(dealId: string, email: string, role: string) {
    const { error } = await supabase
      .from('deal_participants')
      .insert({ deal_id: dealId, email, role });
    if (error) throw new Error(error.message);
  }

  async removeParticipant(dealId: string, email: string, role: string) {
    const { error } = await supabase
      .from('deal_participants')
      .delete()
      .eq('deal_id', dealId)
      .eq('email', email)
      .eq('role', role);
    if (error) throw new Error(error.message);
  }

  async getParticipants(dealId: string) {
    const { data, error } = await supabase
      .from('deal_participants')
      .select('*')
      .eq('deal_id', dealId);
    if (error) throw new Error(error.message);
    return data;
  }
}

// Singleton instance
const dealService = new DealService();

export default dealService;
