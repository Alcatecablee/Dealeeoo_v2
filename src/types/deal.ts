
export type DealStatus = 'pending' | 'paid' | 'complete';

export interface Deal {
  id: string;
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
  status: DealStatus;
  createdAt: string;
}

export interface CreateDealInput {
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
}
