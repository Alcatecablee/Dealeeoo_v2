export type DealStatus = 'pending' | 'paid' | 'complete' | 'disputed' | 'resolved';

export interface Deal {
  id: string;
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
  status: DealStatus;
  createdAt: string;
  buyer_access_token?: string; // Optional as it might not always be selected
  seller_access_token?: string; // Optional for the same reason
  buyer_token_expires_at?: string | null;
  seller_token_expires_at?: string | null;
  disputeReason?: string | null;
  resolutionNote?: string | null;
  notes?: string | null;
  expiry?: string | null;
  deal_type?: string | null;
  currency?: string | null;
  attachment_url?: string | null;
}

export interface CreateDealInput {
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
  buyer_access_token: string;
  seller_access_token: string;
  notes?: string;
  expiry?: string;
  deal_type?: string;
  currency?: string;
  attachment_url?: string;
  creator_user_id?: string;
  guest_id?: string;
}
