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

  useEffect(() => {
    if (localStorage.getItem('adminAuthed') === 'true') {
      setAuthed(true);
    }
  }, []);

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (password === ADMIN_PASSWORD) {
                    setAuthed(true);
                    localStorage.setItem('adminAuthed', 'true');
                  } else {
                    toast.error('Incorrect password');
                  }
                }}
                className="space-y-4"
              >
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
                />
                <Button type="submit" className="w-full bg-gradient-friendly">
                  Sign In
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
          {section === 'deals' && <DealsSection />}
          {section === 'users' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">User Directory</h2>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search users by email..."
                  className="border border-border rounded px-3 py-2 w-full md:w-64"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <select
                  className="border border-border rounded px-3 py-2 w-full md:w-48 text-foreground bg-background"
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                >
                  <option value="" className="text-foreground bg-background">All Roles</option>
                  <option value="buyer" className="text-foreground bg-background">Buyer</option>
                  <option value="seller" className="text-foreground bg-background">Seller</option>
                  <option value="admin" className="text-foreground bg-background">Admin</option>
                </select>
                <select
                  className="border border-border rounded px-3 py-2 w-full md:w-48 text-foreground bg-background"
                  value={userStatus}
                  onChange={e => setUserStatus(e.target.value)}
                >
                  <option value="" className="text-foreground bg-background">All Statuses</option>
                  <option value="active" className="text-foreground bg-background">Active</option>
                  <option value="banned" className="text-foreground bg-background">Banned</option>
                  <option value="pending" className="text-foreground bg-background">Pending</option>
                </select>
                <button className="bg-gradient-friendly text-white px-4 py-2 rounded font-semibold shadow hover:opacity-90 transition" onClick={applyUserFilters}>Apply Filters</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Role</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr className="border-b border-border" key={u.email + i}>
                        <td className="py-2 px-4">{u.email}</td>
                        <td className="py-2 px-4">{u.role}</td>
                        <td className="py-2 px-4">{u.status}</td>
                        <td className="py-2 px-4">
                          <button className="text-blue-500 hover:underline mr-2">View</button>
                          <button className="text-yellow-500 hover:underline mr-2">Ban</button>
                          <button className="text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-muted-foreground text-sm">(User data will be loaded from the database in a future update.)</div>
            </Card>
          )}
          {section === 'disputes' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Dispute Resolution</h2>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search disputes by deal, user, or reason..."
                  className="border border-border rounded px-3 py-2 w-full md:w-96"
                  value={disputeSearch}
                  onChange={e => setDisputeSearch(e.target.value)}
                />
                <select
                  className="border border-border rounded px-3 py-2 w-full md:w-48 text-foreground bg-background"
                  value={disputeStatus}
                  onChange={e => setDisputeStatus(e.target.value)}
                >
                  <option value="" className="text-foreground bg-background">All Statuses</option>
                  <option value="open" className="text-foreground bg-background">Open</option>
                  <option value="resolved" className="text-foreground bg-background">Resolved</option>
                  <option value="escalated" className="text-foreground bg-background">Escalated</option>
                </select>
                <button className="bg-gradient-friendly text-white px-4 py-2 rounded font-semibold shadow hover:opacity-90 transition" onClick={applyDisputeFilters}>Apply Filters</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Deal</th>
                      <th className="text-left py-2 px-4">Buyer</th>
                      <th className="text-left py-2 px-4">Seller</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Reason</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisputes.map((d, i) => (
                      <tr className="border-b border-border" key={d.deal + i}>
                        <td className="py-2 px-4">{d.deal}</td>
                        <td className="py-2 px-4">{d.buyer}</td>
                        <td className="py-2 px-4">{d.seller}</td>
                        <td className="py-2 px-4">{d.status}</td>
                        <td className="py-2 px-4">{d.reason}</td>
                        <td className="py-2 px-4">
                          <button className="text-blue-500 hover:underline mr-2">View</button>
                          <button className="text-green-500 hover:underline mr-2">Resolve</button>
                          <button className="text-yellow-500 hover:underline">Escalate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-muted-foreground text-sm">(Dispute data will be loaded from the database in a future update.)</div>
            </Card>
          )}
          {section === 'analytics' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Analytics & Reporting</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
                  <span className="text-3xl font-bold text-gradient-friendly">$12,500</span>
                  <span className="text-muted-foreground mt-2">Total Volume</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
                  <span className="text-3xl font-bold text-gradient-friendly">42</span>
                  <span className="text-muted-foreground mt-2">Active Deals</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
                  <span className="text-3xl font-bold text-gradient-friendly">128</span>
                  <span className="text-muted-foreground mt-2">Completed Deals</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
                  <span className="text-3xl font-bold text-gradient-friendly">$1,250</span>
                  <span className="text-muted-foreground mt-2">Revenue</span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                <span className="text-lg text-muted-foreground mb-4">Deal Volume (Last 30 Days)</span>
                <div className="w-full h-40 bg-gradient-to-r from-friendly-blue/10 to-friendly-purple/10 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">[Chart Placeholder]</span>
                </div>
              </div>
              <div className="mt-8 text-muted-foreground text-sm">(Analytics will be loaded from the database and visualized with charts in a future update.)</div>
            </Card>
          )}
          {section === 'ai-settings' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">AI Settings</h2>
              <p className="mb-4 text-muted-foreground">Configure API keys for AI providers. These are required for features like AI Deal Advisor, fraud detection, and more.</p>
              <div className="space-y-8 max-w-md">
                {/* OpenAI Key */}
                <AIApiKeyInput provider="OpenAI" storageKey="openaiApiKey" />
                {/* Anthropic Key */}
                <AIApiKeyInput provider="Anthropic" storageKey="anthropicApiKey" />
              </div>
              <div className="mt-8 text-muted-foreground text-sm border-t pt-4">(More providers and advanced settings coming soon.)</div>
            </Card>
          )}
          {section === 'ai-insights' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
              <p className="mb-4 text-muted-foreground">View AI-generated analytics, fraud alerts, dispute suggestions, and more.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fraud/Anomaly Alerts</li>
                <li>Dispute Resolution Suggestions</li>
                <li>Support Ticket Summaries</li>
                <li>User Risk Scores</li>
                <li>Predictive Analytics</li>
                <li>Smart Notifications</li>
              </ul>
              <div className="mt-6 text-muted-foreground text-sm">(Coming soon: live AI insights and dashboards.)</div>
            </Card>
          )}
          {section === 'settings' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-semibold mb-2">Platform Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="border border-border rounded px-3 py-2 w-full bg-background text-foreground"
                    value={5}
                    readOnly
                  />
                  <div className="text-muted-foreground text-xs mt-1">(Editable in future update. Current: 5%)</div>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Payout Schedule</label>
                  <select className="border border-border rounded px-3 py-2 w-full bg-background text-foreground" value="weekly" disabled>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <div className="text-muted-foreground text-xs mt-1">(Editable in future update. Current: Weekly)</div>
                </div>
              </div>
              <div className="mb-8">
                <label className="block font-semibold mb-2">Maintenance Mode</label>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={false} disabled className="h-5 w-5 accent-primary" />
                  <span className="text-muted-foreground">(Toggle coming soon. When enabled, new deals cannot be created.)</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 mt-8">Payment Providers</h3>
              <p className="mb-4 text-muted-foreground">Enter your API keys for each provider and activate the one you want to use. This makes it easy to switch between Stripe, Paystack, Flutterwave, etc. for scaling and global reach.</p>
              <PaymentProvidersSettings />
            </Card>
          )}
          {section === 'logs' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Security & Compliance (Audit Logs)</h2>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search logs by user or action..."
                  className="border border-border rounded px-3 py-2 w-full md:w-96"
                />
                <select className="border border-border rounded px-3 py-2 w-full md:w-48 text-foreground bg-background">
                  <option value="" className="text-foreground bg-background">All Actions</option>
                  <option value="login" className="text-foreground bg-background">Login</option>
                  <option value="update" className="text-foreground bg-background">Update</option>
                  <option value="delete" className="text-foreground bg-background">Delete</option>
                  <option value="ban" className="text-foreground bg-background">Ban</option>
                </select>
                <button className="bg-gradient-friendly text-white px-4 py-2 rounded font-semibold shadow hover:opacity-90 transition">Apply Filters</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Timestamp</th>
                      <th className="text-left py-2 px-4">User</th>
                      <th className="text-left py-2 px-4">Action</th>
                      <th className="text-left py-2 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder audit log data */}
                    <tr className="border-b border-border">
                      <td className="py-2 px-4">2024-05-09 10:15:00</td>
                      <td className="py-2 px-4">admin@example.com</td>
                      <td className="py-2 px-4">Login</td>
                      <td className="py-2 px-4">Admin logged in</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4">2024-05-09 10:17:22</td>
                      <td className="py-2 px-4">alice@example.com</td>
                      <td className="py-2 px-4">Update</td>
                      <td className="py-2 px-4">Updated deal #1234 status to Paid</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4">2024-05-09 10:18:45</td>
                      <td className="py-2 px-4">bob@example.com</td>
                      <td className="py-2 px-4">Ban</td>
                      <td className="py-2 px-4">User banned for suspicious activity</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-muted-foreground text-sm">(Audit log data will be loaded from the database in a future update.)</div>
            </Card>
          )}
          {section === 'support' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Messaging & Support</h2>
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search tickets by user or subject..."
                  className="border border-border rounded px-3 py-2 w-full md:w-96"
                />
                <select className="border border-border rounded px-3 py-2 w-full md:w-48 text-foreground bg-background">
                  <option value="" className="text-foreground bg-background">All Statuses</option>
                  <option value="open" className="text-foreground bg-background">Open</option>
                  <option value="pending" className="text-foreground bg-background">Pending</option>
                  <option value="closed" className="text-foreground bg-background">Closed</option>
                </select>
                <button className="bg-gradient-friendly text-white px-4 py-2 rounded font-semibold shadow hover:opacity-90 transition">Apply Filters</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Ticket ID</th>
                      <th className="text-left py-2 px-4">User</th>
                      <th className="text-left py-2 px-4">Subject</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder support ticket data */}
                    <tr className="border-b border-border">
                      <td className="py-2 px-4">#T1001</td>
                      <td className="py-2 px-4">alice@example.com</td>
                      <td className="py-2 px-4">Unable to mark deal as paid</td>
                      <td className="py-2 px-4">Open</td>
                      <td className="py-2 px-4">
                        <button className="text-blue-500 hover:underline mr-2">View</button>
                        <button className="text-green-500 hover:underline mr-2">Reply</button>
                        <button className="text-red-500 hover:underline">Close</button>
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4">#T1002</td>
                      <td className="py-2 px-4">bob@example.com</td>
                      <td className="py-2 px-4">Dispute not resolved</td>
                      <td className="py-2 px-4">Pending</td>
                      <td className="py-2 px-4">
                        <button className="text-blue-500 hover:underline mr-2">View</button>
                        <button className="text-green-500 hover:underline mr-2">Reply</button>
                        <button className="text-red-500 hover:underline">Close</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-muted-foreground text-sm">(Support ticket data will be loaded from the database in a future update.)</div>
            </Card>
          )}
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