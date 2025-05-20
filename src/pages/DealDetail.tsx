import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStatus } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, ArrowLeft, Copy, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import DealStatusComponent from '@/components/DealStatus';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: <Clock className="w-5 h-5" /> },
  { key: 'paid', label: 'Paid', icon: <DollarSign className="w-5 h-5" /> },
  { key: 'complete', label: 'Complete', icon: <CheckCircle className="w-5 h-5" /> },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  paid: 'bg-blue-500',
  complete: 'bg-green-500',
};

const TEMPLATES = [
  { id: 'custom', emoji: '✨', title: 'Custom Deal' },
  { id: 'recommended-crypto', emoji: '💱', title: 'Crypto Deal' },
  { id: 'recommended-domain', emoji: '🌍', title: 'Domain Transfer' },
  { id: 'recommended-freelance', emoji: '💼', title: 'Freelance Payment' },
  { id: 'domain-reg', emoji: '🌐', title: 'Domain Name Registration' },
  { id: 'realestate', emoji: '🏠', title: 'Real Estate' },
  { id: 'auto', emoji: '🚗', title: 'Automotive Sale' },
  { id: 'equipment-lease', emoji: '🔧', title: 'Equipment Leasing' },
  { id: 'art', emoji: '🖼️', title: 'Art & Collectibles' },
  { id: 'saas', emoji: '🔑', title: 'SaaS License' },
  { id: 'software-key', emoji: '🗝️', title: 'Software Activation Key' },
  { id: 'membership', emoji: '🎫', title: 'Membership Subscription' },
  { id: 'nft-trade', emoji: '🖼️', title: 'NFT Trade' },
  { id: 'ebook', emoji: '📚', title: 'E-book Delivery' },
  { id: 'course', emoji: '🎓', title: 'Online Course Access' },
  { id: 'digital-bundle', emoji: '📦', title: 'Digital Asset Bundle' },
  { id: 'event-ticket', emoji: '🎟️', title: 'Event Tickets' },
  { id: 'workshop', emoji: '🧑‍🏫', title: 'Workshop/Training' },
  { id: 'photo', emoji: '📸', title: 'Photography Session' },
  { id: 'catering', emoji: '🍽️', title: 'Catering Services' },
  { id: 'venue', emoji: '🏢', title: 'Venue Rental' },
  { id: 'electronics', emoji: '📱', title: 'Electronics Sale' },
  { id: 'fashion', emoji: '👗', title: 'Fashion Resale' },
  { id: 'appliances', emoji: '🧊', title: 'Home Appliances' },
  { id: 'furniture', emoji: '🛋️', title: 'Furniture Purchase' },
  { id: 'handmade', emoji: '🧶', title: 'Handmade Crafts' },
  { id: 'loan', emoji: '💸', title: 'Personal Loan' },
  { id: 'p2p-lending', emoji: '🤝', title: 'Peer-to-Peer Lending' },
  { id: 'crowdfunding', emoji: '🤲', title: 'Crowdfunding Pledge' },
  { id: 'invoice', emoji: '🧾', title: 'Invoice Financing' },
  { id: 'vehicle-rental', emoji: '🚙', title: 'Vehicle Rental' },
  { id: 'equipment-rental', emoji: '🔨', title: 'Equipment Rental' },
  { id: 'vacation', emoji: '🏖️', title: 'Vacation Home Rental' },
  { id: 'wfh-space', emoji: '🏢', title: 'Work-from-Home Space' },
  { id: 'legal', emoji: '⚖️', title: 'Legal Retainer' },
  { id: 'consulting', emoji: '👔', title: 'Consulting Fees' },
  { id: 'accounting', emoji: '📊', title: 'Accounting & Tax' },
  { id: 'medical', emoji: '🩺', title: 'Medical Second Opinion' },
  { id: 'wholesale', emoji: '🚚', title: 'Wholesale Purchase' },
  { id: 'supply-chain', emoji: '🔗', title: 'Supply Chain Milestone' },
  { id: 'import-export', emoji: '🛳️', title: 'Import/Export Goods' },
  { id: 'tutoring', emoji: '📖', title: 'Tutoring Session' },
  { id: 'coaching', emoji: '🎯', title: 'Career Coaching' },
  { id: 'certification', emoji: '📜', title: 'Certification Prep' },
  { id: 'donation', emoji: '🤲', title: 'Donation Release' },
  { id: 'grant', emoji: '🎁', title: 'Grant Disbursement' },
  { id: 'scholarship', emoji: '🎓', title: 'Scholarship Fund' },
];

const PRICING_PLANS = [
  { key: 'hustler', percent: 1, min: 0, max: 100 },
  { key: 'freelancer', percent: 2, min: 101, max: 3000 },
  { key: 'business', percent: 3, min: 3001, max: 10000 },
  { key: 'enterprise', percent: 4, min: 10001, max: Infinity },
];

function getPricingPlan(amount: number) {
  if (isNaN(amount) || amount <= 0) return PRICING_PLANS[0];
  return PRICING_PLANS.find(plan => amount >= plan.min && amount <= plan.max) || PRICING_PLANS[PRICING_PLANS.length - 1];
}

interface DealRow {
  id: string;
  title: string;
  description: string;
  amount: number;
  buyer_email: string;
  seller_email: string;
  status: DealStatus;
  created_at: string;
  buyer_access_token: string;
  seller_access_token: string;
  buyer_token_expires_at: string | null;
  seller_token_expires_at: string | null;
}

interface DealDetailProps {
  dealId?: string;
}

const DealDetail: React.FC<DealDetailProps> = ({ dealId }) => {
  // Use dealId prop if provided, otherwise fallback to useParams
  const params = useParams<{ id: string }>();
  const id = dealId || params.id;
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'observer' | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    // Attempt to load user email if already identified (e.g. page refresh after token auth)
    const storedEmail = localStorage.getItem('userEmail');
    const storedTokenForDeal = storedEmail ? localStorage.getItem(`dealToken_${id}_${storedEmail}`) : null;

    if (id) {
      fetchDealAndValidateToken(id, token, storedTokenForDeal, storedEmail);
    }

    // Set up real-time subscription
    const subscription = supabase
      .channel(`public:deals:id=eq.${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deals',
        filter: `id=eq.${id}`
      }, (payload) => {
        // Re-fetch and re-validate on change. Token might not be in URL anymore.
        const currentToken = queryParams.get('token') || (userEmail ? localStorage.getItem(`dealToken_${id}_${userEmail}`) : null);
        fetchDealAndValidateToken(id!, currentToken, currentToken, userEmail);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchDealAndValidateToken = async (dealId: string, urlToken: string | null, storedToken: string | null, storedEmailForToken: string | null) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, buyer_access_token, seller_access_token, buyer_token_expires_at, seller_token_expires_at')
        .eq('id', dealId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setDeal(null);
        setUserRole('observer');
        toast.error("Deal not found.");
        return;
      }

      const dealData = data as unknown as DealRow;
      const fetchedDeal: Deal = {
        id: dealData.id,
        title: dealData.title,
        description: dealData.description,
        amount: dealData.amount,
        buyerEmail: dealData.buyer_email,
        sellerEmail: dealData.seller_email,
        status: dealData.status,
        createdAt: dealData.created_at,
        buyer_access_token: dealData.buyer_access_token,
        seller_access_token: dealData.seller_access_token,
        buyer_token_expires_at: dealData.buyer_token_expires_at,
        seller_token_expires_at: dealData.seller_token_expires_at,
        disputeReason: (dealData as any).dispute_reason ?? null,
        resolutionNote: (dealData as any).resolution_note ?? null,
      };
      setDeal(fetchedDeal);

      let identifiedRole: 'buyer' | 'seller' | 'observer' = 'observer';
      let identifiedEmail: string | null = null;
      let expired = false;

      // Priority 1: URL token
      if (urlToken) {
        if (urlToken === fetchedDeal.buyer_access_token) {
          if (fetchedDeal.buyer_token_expires_at && new Date(fetchedDeal.buyer_token_expires_at) < new Date()) {
            toast.error('Your access link has expired. Please request a new one.');
            setUserRole('observer');
            setUserEmail(null);
            setTokenExpired(true);
            expired = true;
            return;
          }
          identifiedRole = 'buyer';
          identifiedEmail = fetchedDeal.buyerEmail;
          localStorage.setItem('userEmail', fetchedDeal.buyerEmail);
          localStorage.setItem(`dealToken_${dealId}_${fetchedDeal.buyerEmail}`, urlToken);
        } else if (urlToken === fetchedDeal.seller_access_token) {
          if (fetchedDeal.seller_token_expires_at && new Date(fetchedDeal.seller_token_expires_at) < new Date()) {
            toast.error('Your access link has expired. Please request a new one.');
            setUserRole('observer');
            setUserEmail(null);
            setTokenExpired(true);
            expired = true;
            return;
          }
          identifiedRole = 'seller';
          identifiedEmail = fetchedDeal.sellerEmail;
          localStorage.setItem('userEmail', fetchedDeal.sellerEmail);
          localStorage.setItem(`dealToken_${dealId}_${fetchedDeal.sellerEmail}`, urlToken); 
        }
      } 
      // Priority 2: Stored token (e.g. page refresh, or if creator accesses directly)
      else if (storedToken && storedEmailForToken) {
        if (storedEmailForToken === fetchedDeal.buyerEmail && storedToken === fetchedDeal.buyer_access_token) {
          if (fetchedDeal.buyer_token_expires_at && new Date(fetchedDeal.buyer_token_expires_at) < new Date()) {
            toast.error('Your access link has expired. Please request a new one.');
            setUserRole('observer');
            setUserEmail(null);
            setTokenExpired(true);
            expired = true;
            return;
          }
          identifiedRole = 'buyer';
          identifiedEmail = fetchedDeal.buyerEmail;
        } else if (storedEmailForToken === fetchedDeal.sellerEmail && storedToken === fetchedDeal.seller_access_token) {
          if (fetchedDeal.seller_token_expires_at && new Date(fetchedDeal.seller_token_expires_at) < new Date()) {
            toast.error('Your access link has expired. Please request a new one.');
            setUserRole('observer');
            setUserEmail(null);
            setTokenExpired(true);
            expired = true;
            return;
          }
          identifiedRole = 'seller';
          identifiedEmail = fetchedDeal.sellerEmail;
        }
      }
      if (!expired) setTokenExpired(false);
      setUserEmail(identifiedEmail);
      setUserRole(identifiedRole);
      if (urlToken && identifiedRole === 'observer') {
        toast.error("Invalid or expired access token.");
      }
    } catch (fetchError) {
      toast.error('Failed to load deal information');
      setDeal(null);
      setUserRole('observer');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (newStatus: DealStatus) => {
    if (!userRole || userRole === 'observer') {
      toast.error("You do not have permission to perform this action.");
      return;
    }
  const isBuyer = userEmail === deal.buyerEmail && userRole === 'buyer';
  const isSeller = userEmail === deal.sellerEmail && userRole === 'seller';

    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Deal marked as ${newStatus}`);
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

  const dealUrl = `${window.location.origin}/deal/${id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dealUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleResendLink = async () => {
    if (!deal || (!deal.buyerEmail && !deal.sellerEmail)) return;
    setResendLoading(true);
    try {
      const role = userEmail === deal.buyerEmail ? 'buyer' : userEmail === deal.sellerEmail ? 'seller' : null;
      const email = userEmail || '';
      if (!role || !email) {
        toast.error('Unable to determine your role or email.');
        setResendLoading(false);
        return;
      }
      const res = await fetch('/api/rotate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal.id, userRole: role, email }),
      });
      if (res.ok) {
        toast.success('A new access link has been sent to your email.');
      } else {
        toast.error('Failed to send new link. Please try again later.');
      }
    } catch (err) {
      toast.error('Failed to send new link. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  if (tokenExpired) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Header />
        <Card className="max-w-md w-full p-8 text-center">
          <CardTitle>Access Link Expired</CardTitle>
          <CardContent>
            <p className="mb-4">Your secure access link has expired for this deal. For your security, you need a new link to continue.</p>
            <Button onClick={handleResendLink} disabled={resendLoading} className="w-full">
              {resendLoading ? 'Sending...' : 'Request New Link'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-center text-muted-foreground">Deal not found or access denied.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Only render the DealStatusComponent for the deal view
  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <DealStatusComponent 
          deal={deal} 
          onUpdate={() => fetchDealAndValidateToken(id!, null, null, userEmail)} 
          userRole={userRole || 'observer'}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
};

export default DealDetail;
