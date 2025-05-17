import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStatus } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, Search, ArrowUpDown, Eye, Users, BarChart2, Settings, FileText, MessageCircle, ListChecks, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
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
import DealsSection from '@/components/admin/DealsSection';
import PaymentProvidersSettings from '@/components/admin/PaymentProvidersSettings';
import DisputesAdmin from './admin/Disputes';

const ADMIN_PASSWORD = "Shacli1991";

const statusOptions: DealStatus[] = ['pending', 'paid', 'complete'];

const SECTIONS = [
  { key: 'deals', label: 'Deals', icon: <ListChecks className="w-5 h-5 mr-2" /> },
  { key: 'users', label: 'Users', icon: <Users className="w-5 h-5 mr-2" /> },
  { key: 'disputes', label: 'Disputes', icon: <FileText className="w-5 h-5 mr-2" /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  { key: 'ai-settings', label: 'AI Settings', icon: <Settings className="w-5 h-5 mr-2" /> },
  { key: 'ai-insights', label: 'AI Insights', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-2" /> },
  { key: 'logs', label: 'Audit Logs', icon: <FileText className="w-5 h-5 mr-2" /> },
  { key: 'support', label: 'Support', icon: <MessageCircle className="w-5 h-5 mr-2" /> },
];

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'buyerEmail' | 'sellerEmail'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [viewDealModal, setViewDealModal] = useState(false);
  const [section, setSection] = useState('deals');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([
    { email: 'alice@example.com', role: 'Buyer', status: 'Active' },
    { email: 'bob@example.com', role: 'Seller', status: 'Pending' },
    { email: 'admin@example.com', role: 'Admin', status: 'Active' },
  ]);
  const allUsers = [
    { email: 'alice@example.com', role: 'Buyer', status: 'Active' },
    { email: 'bob@example.com', role: 'Seller', status: 'Pending' },
    { email: 'admin@example.com', role: 'Admin', status: 'Active' },
  ];
  const applyUserFilters = () => {
    setFilteredUsers(
      allUsers.filter(u =>
        (!userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
        (!userRole || u.role.toLowerCase() === userRole.toLowerCase()) &&
        (!userStatus || u.status.toLowerCase() === userStatus.toLowerCase())
      )
    );
  };
  const [disputeSearch, setDisputeSearch] = useState('');
  const [disputeStatus, setDisputeStatus] = useState('');
  const [filteredDisputes, setFilteredDisputes] = useState([
    { deal: '#1234', buyer: 'alice@example.com', seller: 'bob@example.com', status: 'Open', reason: 'Non-delivery of service' },
    { deal: '#5678', buyer: 'carol@example.com', seller: 'dave@example.com', status: 'Escalated', reason: 'Payment not received' },
  ]);
  const allDisputes = [
    { deal: '#1234', buyer: 'alice@example.com', seller: 'bob@example.com', status: 'Open', reason: 'Non-delivery of service' },
    { deal: '#5678', buyer: 'carol@example.com', seller: 'dave@example.com', status: 'Escalated', reason: 'Payment not received' },
  ];
  const applyDisputeFilters = () => {
    setFilteredDisputes(
      allDisputes.filter(d =>
        (!disputeSearch || d.deal.toLowerCase().includes(disputeSearch.toLowerCase()) || d.buyer.toLowerCase().includes(disputeSearch.toLowerCase()) || d.seller.toLowerCase().includes(disputeSearch.toLowerCase()) || d.reason.toLowerCase().includes(disputeSearch.toLowerCase())) &&
        (!disputeStatus || d.status.toLowerCase() === disputeStatus.toLowerCase())
      )
    );
  };
  const [adminTab, setAdminTab] = useState<'disputes' | 'analytics' | 'users'>('disputes');

  useEffect(() => {
    // Check for existing session
    const session = sessionStorage.getItem('adminSession');
    if (session) {
      const { expiry } = JSON.parse(session);
      if (expiry > Date.now()) {
      setAuthed(true);
        setSessionExpiry(expiry);
      } else {
        sessionStorage.removeItem('adminSession');
      }
    }

    // Check for lockout
    const lockout = localStorage.getItem('adminLockout');
    if (lockout) {
      const lockoutTime = parseInt(lockout);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem('adminLockout');
      }
    }
  }, []);

  // Session expiry check
  useEffect(() => {
    if (sessionExpiry) {
      const interval = setInterval(() => {
        if (Date.now() >= sessionExpiry) {
          setAuthed(false);
          sessionStorage.removeItem('adminSession');
          toast.error('Your session has expired. Please log in again.');
        }
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [sessionExpiry]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 60000);
      toast.error(`Account is locked. Please try again in ${remainingTime} minutes.`);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const expiry = Date.now() + (8 * 60 * 60 * 1000); // 8 hours
        sessionStorage.setItem('adminSession', JSON.stringify({ expiry }));
        setAuthed(true);
        setSessionExpiry(expiry);
        setLoginAttempts(0);
        localStorage.removeItem('adminLockout');
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          const lockoutTime = Date.now() + (15 * 60 * 1000); // 15 minutes
          setLockoutUntil(lockoutTime);
          localStorage.setItem('adminLockout', lockoutTime.toString());
          toast.error(`Too many failed attempts. Account locked for 15 minutes.`);
        } else {
          toast.error(`Invalid password. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    setAuthed(false);
    setSessionExpiry(null);
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    if (authed) {
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
    }
  }, [authed]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      let query = supabase.from('deals').select('*');
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,buyer_email.ilike.%${search}%,seller_email.ilike.%${search}%`);
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
      console.error('Error fetching deals:', error);
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
      console.error('Error updating deal:', error);
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

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
        <Header />
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
                  disabled={!!lockoutUntil}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-friendly"
                  disabled={!!lockoutUntil}
                >
                  {lockoutUntil ? 'Account Locked' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-screen p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold mb-6 text-gradient-friendly">Admin Panel</h2>
          {SECTIONS.map((s) => (
            <Button
              key={s.key}
              variant={section === s.key ? 'default' : 'ghost'}
              className="w-full flex items-center justify-start mb-2"
              onClick={() => {
                setSection(s.key);
              }}
            >
              {s.icon}
              {s.label}
            </Button>
          ))}
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-4 mb-6">
              <button onClick={() => setAdminTab('disputes')} className={`px-4 py-2 rounded-lg font-bold ${adminTab === 'disputes' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>Disputes</button>
              <button onClick={() => setAdminTab('analytics')} className={`px-4 py-2 rounded-lg font-bold ${adminTab === 'analytics' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>Analytics</button>
              <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-lg font-bold ${adminTab === 'users' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>User Management</button>
              </div>
            {adminTab === 'disputes' && <DisputesAdmin />}
            {adminTab === 'analytics' && (
              <div className="p-8 bg-white border rounded-lg shadow text-center text-lg text-muted-foreground">
                <b>Analytics Dashboard</b> (Coming soon: deal volume, dispute rates, revenue, etc.)
              </div>
            )}
            {adminTab === 'users' && (
              <div className="p-8 bg-white border rounded-lg shadow text-center text-lg text-muted-foreground">
                <b>User Management</b> (Coming soon: user list, search, ban, etc.)
              </div>
            )}
              </div>
        </main>
      </div>

      <Dialog open={viewDealModal} onOpenChange={setViewDealModal}>
        <DialogContent className="max-w-2xl">
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
    </div>
  );
};

function AIApiKeyInput({ provider, storageKey }: { provider: string; storageKey: string }) {
  const [key, setKey] = React.useState('');
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(storageKey) || '';
    setKey(saved);
  }, [storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, key);
    toast.success(`${provider} API key saved!`);
  };

  return (
    <div>
      <label className="block font-semibold mb-2">{provider} API Key</label>
      <div className="flex items-center gap-2">
        <input
          type={show ? 'text' : 'password'}
          className="border border-border rounded px-3 py-2 w-full bg-background text-foreground"
          placeholder={`Enter your ${provider} API key`}
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <Button onClick={handleSave} className="ml-2">Save</Button>
      </div>
    </div>
  );
}

export default Admin; 