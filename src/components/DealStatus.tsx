import React, { useEffect, useState } from 'react';
import { Deal } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, DollarSign, Clock, AlertCircle, Copy, Lock, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import dealService from '@/lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DealChat from './DealChat';
import DealAuditTrail from './DealAuditTrail';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DealStatusProps {
  deal: Deal;
  onUpdate: () => void;
  userRole: 'buyer' | 'seller' | 'observer';
  userEmail: string | null;
}

const DealStatus: React.FC<DealStatusProps> = ({ deal, onUpdate, userRole, userEmail }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [disputeReason, setDisputeReason] = React.useState('');
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showSecureBadge, setShowSecureBadge] = React.useState(false);
  const [expiryCountdown, setExpiryCountdown] = React.useState<string | null>(null);
  const [maskEmails, setMaskEmails] = React.useState(userRole === 'observer');
  const [participants, setParticipants] = useState<{ email: string; role: string }[]>([]);
  const [showGatewayModal, setShowGatewayModal] = React.useState(false);
  const [gatewayLoading, setGatewayLoading] = React.useState(false);
  const [paymentGateways, setPaymentGateways] = React.useState([
    { key: 'stripe', label: 'Stripe', enabled: false },
    { key: 'wise', label: 'Wise', enabled: false },
    { key: 'manual', label: 'Manual Payment', enabled: true },
  ]);
  const [gatewaysLoading, setGatewaysLoading] = React.useState(true);

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

  const getStatusMessage = () => {
    if (userRole === 'buyer') {
      switch (deal.status) {
        case 'pending':
          return "Please mark as paid once you've sent the payment.";
        case 'paid':
          return "Waiting for seller to confirm delivery.";
        case 'complete':
          return "Deal completed successfully!";
        default:
          return "";
      }
    } else if (userRole === 'seller') {
      switch (deal.status) {
        case 'pending':
          return "Waiting for buyer to mark the payment as sent.";
        case 'paid':
          return "Please mark as complete once you've delivered the goods/services.";
        case 'complete':
          return "Deal completed successfully!";
        default:
          return "";
      }
    }
    return "";
  };

  const isBuyer = userRole === 'buyer' && userEmail === deal.buyerEmail;
  const isSeller = userRole === 'seller' && userEmail === deal.sellerEmail;

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedEmail(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const expiry = userRole === 'buyer' ? deal.buyer_token_expires_at : userRole === 'seller' ? deal.seller_token_expires_at : null;

  React.useEffect(() => {
    if (!expiry) return;
    const updateCountdown = () => {
      const now = new Date();
      const exp = new Date(expiry);
      const diff = exp.getTime() - now.getTime();
      if (diff <= 0) {
        setExpiryCountdown('Expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setExpiryCountdown(
        `Link expires in${days > 0 ? ` ${days} day${days > 1 ? 's' : ''},` : ''}${hours > 0 ? ` ${hours} hour${hours > 1 ? 's' : ''},` : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [expiry]);

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return email;
    return name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name.slice(-1) + '@' + domain;
  };

  const handleDispute = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: 'disputed', disputeReason: disputeReason })
        .eq('id', deal.id);

      if (error) throw error;

      // Notify parties and admin
      await fetch('/api/notify-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal.id, reason: disputeReason, filedBy: userEmail })
      });

      toast.success('Dispute filed successfully. Our team will review your case.');
      setShowDisputeDialog(false);
      setDisputeReason('');
    } catch (error) {
      console.error('Error filing dispute:', error);
      toast.error('Failed to file dispute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // PDF generation
  const handleDownloadReceipt = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Dealeeoo Deal Receipt', 10, 15);
    doc.setFontSize(12);
    doc.text(`Deal ID: ${deal.id}`, 10, 25);
    doc.text(`Title: ${deal.title}`, 10, 32);
    doc.text(`Description: ${deal.description}`, 10, 39);
    doc.text(`Amount: $${deal.amount.toFixed(2)}`, 10, 46);
    doc.text(`Buyer: ${deal.buyerEmail}`, 10, 53);
    doc.text(`Seller: ${deal.sellerEmail}`, 10, 60);
    doc.text(`Status: ${deal.status}`, 10, 67);
    if (deal.status === 'disputed' && deal.disputeReason) {
      doc.text(`Dispute Reason: ${deal.disputeReason}`, 10, 74);
    }
    if (deal.status === 'resolved' && deal.resolutionNote) {
      doc.text(`Resolution Note: ${deal.resolutionNote}`, 10, 81);
    }
    doc.text('---', 10, 88);
    doc.text('Timeline:', 10, 95);
    // Optionally, fetch audit events or pass as prop
    // For now, just show status changes
    let y = 102;
    doc.text(`Created: ${new Date(deal.createdAt).toLocaleString()}`, 10, y);
    y += 7;
    doc.text(`Current Status: ${deal.status}`, 10, y);
    y += 7;
    doc.text('For full timeline, see the Dealeeoo platform.', 10, y);
    doc.save(`dealeeoo-receipt-${deal.id}.pdf`);
  };

  // Email receipt
  const handleSendReceipt = async () => {
    try {
      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal.id, userEmail }),
      });
      if (res.ok) {
        toast.success('Receipt sent to your email!');
      } else {
        toast.error('Failed to send receipt.');
      }
    } catch (err) {
      toast.error('Failed to send receipt.');
    }
  };

  // Helper for status badge color
  const getStatusBadgeColor = () => {
    switch (deal.status) {
      case 'pending': return 'bg-yellow-600 text-yellow-100';
      case 'paid': return 'bg-blue-600 text-blue-100';
      case 'complete': return 'bg-green-600 text-green-100';
      case 'disputed': return 'bg-red-600 text-red-100';
      case 'resolved': return 'bg-green-700 text-green-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  React.useEffect(() => {
    if (deal.status === 'complete' || deal.status === 'resolved') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [deal.status]);

  React.useEffect(() => {
    setShowSecureBadge(true);
    const timer = setTimeout(() => setShowSecureBadge(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await import('@/lib/api');
        const api = res.default;
        const data = await api.getParticipants(deal.id);
        setParticipants(data || []);
      } catch {}
    })();
  }, [deal.id]);

  React.useEffect(() => {
    setGatewaysLoading(true);
    fetch('/api/gateways')
      .then(res => res.json())
      .then(data => setPaymentGateways(data))
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  }, []);

  async function handleGatewaySelect(gatewayKey: string) {
    setGatewayLoading(true);
    // Log the selection for analytics
    await fetch('/api/log-gateway-choice', {
      method: 'POST',
      body: JSON.stringify({ dealId: deal.id, userEmail, gateway: gatewayKey }),
      headers: { 'Content-Type': 'application/json' }
    });
    const gateway = paymentGateways.find(gw => gw.key === gatewayKey);
    setTimeout(() => { // Simulate network delay
      setGatewayLoading(false);
      setShowGatewayModal(false);
      if (gateway?.enabled && gateway.key !== 'manual') {
        // Redirect to real payment gateway (placeholder)
        window.location.href = `/api/pay/${gateway.key}?dealId=${deal.id}`;
      } else {
        // Redirect to manual payment instructions
        window.location.href = `/deal/${deal.id}/manual-payment?gateway=${gatewayKey}`;
      }
    }, 600);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 py-8 px-2 transition-colors duration-700">
      <Card className="max-w-2xl mx-auto shadow-2xl rounded-2xl border-0 bg-gray-900/95 animate-fade-in relative overflow-hidden">
        {/* Gradient border accent */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-transparent" style={{boxShadow: '0 0 0 4px transparent, 0 0 32px 0 #5B78FF55'}}></div>
        <CardHeader className="flex flex-col items-center gap-2 border-b border-blue-900/40 pb-4 bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 animate-fade-in-down">
          <img src="/d-logo.png" alt="Dealeeoo Logo" className="w-12 h-12 mb-2 drop-shadow-glow animate-float" />
          <CardTitle className="text-3xl font-bold text-white text-center animate-fade-in-up">{deal.title}</CardTitle>
          <Badge className={`mt-2 px-4 py-1 rounded-full text-base font-semibold status-badge status-${deal.status} ${getStatusBadgeColor()} animate-pulse-soft bg-gradient-to-r from-blue-600 via-purple-600 to-blue-400 text-white shadow-lg`}>{deal.status.toUpperCase()}</Badge>
          <p className="text-muted-foreground text-center mt-2 text-lg text-gray-300 animate-fade-in-up delay-100">{deal.description}</p>
        </CardHeader>
        <CardContent className="pt-6 pb-2 bg-gray-900">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-6">
            <div className="flex-1">
              <div className="text-3xl font-extrabold text-blue-300 mb-1 animate-fade-in-up">${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="text-sm text-blue-400 mb-2">Fee: <span className="font-semibold text-blue-200">${(deal.amount * 0.03).toFixed(2)}</span></div>
              <div className="mt-2 text-base text-blue-200"><span className="font-semibold">Buyer:</span> {maskEmails ? maskEmail(deal.buyerEmail) : deal.buyerEmail}</div>
              <div className="text-base text-purple-200"><span className="font-semibold">Seller:</span> {maskEmails ? maskEmail(deal.sellerEmail) : deal.sellerEmail}</div>
              {userRole === 'observer' && (
                <Button size="sm" variant="outline" onClick={() => setMaskEmails(m => !m)} aria-label={maskEmails ? 'Show emails' : 'Hide emails'} className="mt-2 bg-gradient-to-r from-blue-800 to-purple-800 text-white border-none hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  {maskEmails ? 'Show Emails' : 'Hide Emails'}
                </Button>
              )}
              <div className="mt-4 text-xs text-gray-500">Created: {new Date(deal.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Modern Progress Bar with gradient and animation */}
              <div className="w-full max-w-xs animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deal.status !== 'pending' ? 'bg-gradient-to-br from-green-400 via-green-600 to-green-800 shadow-lg animate-pulse-soft' : 'bg-gray-800'}`}> <CheckCircle className="text-white" size={20} /> </div>
                    <span className="text-xs mt-1 text-gray-300">Created</span>
                  </div>
                  <div className="flex-1 h-1 mx-1 bg-gray-800 relative overflow-hidden rounded-full">
                    <div className={`absolute h-1 top-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 transition-all duration-700 ${deal.status === 'pending' ? 'w-0' : deal.status === 'paid' ? 'w-1/2' : (deal.status === 'complete' || deal.status === 'resolved') ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deal.status === 'paid' || deal.status === 'complete' || deal.status === 'resolved' ? 'bg-gradient-to-br from-blue-400 via-blue-600 to-purple-700 shadow-lg animate-pulse-soft' : 'bg-gray-800'}`}> <DollarSign className="text-white" size={20} /> </div>
                    <span className="text-xs mt-1 text-gray-300">Paid</span>
                  </div>
                  <div className="flex-1 h-1 mx-1 bg-gray-800 relative overflow-hidden rounded-full">
                    <div className={`absolute h-1 top-0 left-0 bg-gradient-to-r from-purple-500 to-green-400 transition-all duration-700 ${(deal.status === 'complete' || deal.status === 'resolved') ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(deal.status === 'complete' || deal.status === 'resolved') ? 'bg-gradient-to-br from-green-400 via-green-600 to-green-800 shadow-lg animate-pulse-soft' : 'bg-gray-800'}`}> <CheckCircle className="text-white" size={20} /> </div>
                    <span className="text-xs mt-1 text-gray-300">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Status Message */}
          <div className="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-blue-900/60 border border-blue-800 p-4 rounded-lg mt-6 flex items-start gap-3 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 text-blue-300 mt-0.5 animate-fade-in" />
            <p className="text-base text-blue-100 animate-fade-in-up delay-100">{getStatusMessage()}</p>
          </div>
          {/* Mark as Paid button for buyer */}
          {isBuyer && deal.status === 'pending' && (
            <>
              <Button
                className="mt-6 w-full text-lg font-semibold py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-400 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 animate-fade-in-up"
                variant="default"
                onClick={() => setShowGatewayModal(true)}
                aria-label="Mark as Paid"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Mark as Paid
              </Button>
              <Dialog open={showGatewayModal} onOpenChange={setShowGatewayModal}>
                <DialogContent className="max-w-md w-full bg-gray-900 border border-blue-900/40">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white mb-2">Choose a Payment Method</DialogTitle>
                  </DialogHeader>
                  {gatewaysLoading ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {paymentGateways.map(gw => (
                        <Button
                          key={gw.key}
                          onClick={() => handleGatewaySelect(gw.key)}
                          disabled={gatewayLoading}
                          className={`w-full py-4 text-lg font-semibold flex items-center justify-center gap-2 ${gw.enabled ? 'bg-gradient-to-r from-blue-700 to-purple-700 text-white' : 'bg-gray-800 text-gray-400'} transition-all duration-300`}
                        >
                          {gw.label} {gw.enabled ? '' : '(Coming Soon)'}
                          {gatewayLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-4 text-center">Manual payment is always available. More gateways coming soon!</div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {/* Add dispute button for both buyer and seller */}
          {deal.status !== 'disputed' && (
            <div className="mt-6">
              <AlertDialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-red-700 via-red-500 to-yellow-500 text-white shadow-lg hover:from-red-600 hover:to-yellow-400 transition-all duration-300 animate-fade-in-up"
                    disabled={isLoading}
                    aria-label="File Dispute"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                    File Dispute
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>File a Dispute</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to file a dispute? This will pause the deal and alert our team to review the situation.
                      Please ensure you have attempted to resolve the issue with the other party first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <label htmlFor="dispute-reason" className="block text-sm font-medium mb-1">Reason for Dispute</label>
                    <textarea
                      id="dispute-reason"
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                      value={disputeReason}
                      onChange={e => setDisputeReason(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDispute} disabled={!disputeReason.trim()} className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50">
                      File Dispute
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-2 mt-6">
            <Button variant="outline" onClick={handleDownloadReceipt} disabled={isLoading} aria-label="Download Receipt" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto bg-gradient-to-r from-blue-900 to-blue-700 text-blue-100 border-none animate-fade-in-up">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download Receipt'}
            </Button>
            <Button variant="outline" onClick={handleSendReceipt} disabled={isLoading} aria-label="Send Receipt via Email" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto bg-gradient-to-r from-purple-900 to-blue-700 text-blue-100 border-none animate-fade-in-up">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Receipt via Email'}
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/'} aria-label="Back to Dashboard" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto text-blue-200 animate-fade-in-up">Back to Dashboard</Button>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-6 px-6 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 animate-fade-in-up">
          <Tabs>
            <Tab label="Chat">
              <DealChat dealId={deal.id} userEmail={userEmail} />
            </Tab>
            <Tab label="History">
              <DealAuditTrail dealId={deal.id} currentStatus={deal.status} buyerEmail={deal.buyerEmail} sellerEmail={deal.sellerEmail} />
            </Tab>
          </Tabs>
        </CardFooter>
      </Card>
    </div>
  );
};

// Add UserIcon for buyer/seller
const UserIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}><circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0 1 13 0" /></svg>
  );

// Add simple Tabs/Tab implementation if not present
const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = React.useState(0);
  const tabs = React.Children.toArray(children) as React.ReactElement[];
  return (
    <div>
      <div className="flex border-b mb-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`px-4 py-2 font-semibold focus:outline-none transition border-b-2 ${active === i ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-transparent'}`}
            onClick={() => setActive(i)}
            type="button"
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="pt-2">{tabs[active]}</div>
    </div>
  );
};

const Tab = ({ children }: { children: React.ReactNode; label?: string }) => <div>{children}</div>;

export default DealStatus;
