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
}

export interface CreateDealInput {
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
  buyer_access_token: string;
  seller_access_token: string;
}
