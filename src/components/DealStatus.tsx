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

  return (
    <div className="space-y-6 font-sans">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
      <Card className="w-full max-w-3xl mx-auto shadow-xl border border-primary/30 bg-background/80">
        {/* Status Banner */}
        {(deal.status === 'disputed' || deal.status === 'resolved') && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-t-lg px-6 py-4 text-white font-semibold text-center ${deal.status === 'disputed' ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {deal.status === 'disputed' ? (
              <>
                <span className="inline-flex items-center gap-2"><AlertTriangle className="w-5 h-5 inline" /> This deal is currently <b>in dispute</b>.</span>
                {deal.disputeReason && (
                  <div className="mt-2 text-sm font-normal text-red-100">Reason: {deal.disputeReason}</div>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2"><CheckCircle className="w-5 h-5 inline" /> This dispute has been <b>resolved</b>.</span>
                {deal.resolutionNote && (
                  <div className="mt-2 text-sm font-normal text-green-100">Resolution: {deal.resolutionNote}</div>
                )}
              </>
            )}
          </div>
        )}
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/d-logo.png" alt="Dealeeoo Logo" className="w-8 h-8" />
              <CardTitle className="text-2xl flex items-center gap-2 font-brand">
                {deal.title}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border border-opacity-40 ${getStatusBadgeColor()} animate-pulse`}
                  aria-label={`Deal status: ${deal.status}`}
                >
                  {deal.status.toUpperCase()}
            </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(deal.id, 'Deal ID')} aria-label="Copy Deal ID" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copiedEmail === 'Deal ID' ? 'Copied!' : 'Copy Deal ID'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-muted-foreground select-all">{deal.id.slice(0, 8)}...{deal.id.slice(-4)}</span>
        </div>
          </div>
          {expiry && (
            <div className="text-xs text-muted-foreground mt-2 flex flex-col gap-1" aria-label="Link expires">
              <span>Link expires: {new Date(expiry).toLocaleString()}</span>
              {expiryCountdown && <span className="text-warning-foreground font-semibold">{expiryCountdown}</span>}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <AnimatePresence>
              {showSecureBadge && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-900/20 text-green-400 border border-green-400/30 shadow"
                >
                  <Lock className="w-3 h-3 mr-1" /> Secure by Dealeeoo
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-lg text-foreground font-semibold mb-4">{deal.description}</p>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount</h3>
                <p className="text-3xl font-bold text-gradient-friendly">${deal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fee</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-lg font-semibold text-primary cursor-pointer underline" title={`3% platform fee. This covers payment processing, dispute resolution, and secure escrow.`}>{((deal.amount * 0.03)).toFixed(2)}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      3% platform fee. This covers payment processing, dispute resolution, and secure escrow.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created on</h3>
                <p className="text-foreground">{new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-2 items-center mb-2">
                  <span className="text-xs text-muted-foreground">Buyer:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded bg-muted/40 min-h-[40px] max-w-full md:max-w-xs break-all md:truncate">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <a href={`mailto:${deal.buyerEmail}`} className="text-foreground underline flex-1">
                      {maskEmails ? maskEmail(deal.buyerEmail) : deal.buyerEmail}
                    </a>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleCopy(deal.buyerEmail, 'Buyer Email')} aria-label="Copy Buyer Email" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{copiedEmail === 'Buyer Email' ? 'Copied!' : 'Copy Email'}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isBuyer && <span className="ml-1 text-xs text-primary">(You)</span>}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Seller:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded bg-muted/40 min-h-[40px] max-w-full md:max-w-xs break-all md:truncate">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <a href={`mailto:${deal.sellerEmail}`} className="text-foreground underline flex-1">
                      {maskEmails ? maskEmail(deal.sellerEmail) : deal.sellerEmail}
                    </a>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleCopy(deal.sellerEmail, 'Seller Email')} aria-label="Copy Seller Email" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{copiedEmail === 'Seller Email' ? 'Copied!' : 'Copy Email'}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isSeller && <span className="ml-1 text-xs text-primary">(You)</span>}
                  </span>
                </div>
                {userRole === 'observer' && (
                  <Button size="sm" variant="outline" onClick={() => setMaskEmails(m => !m)} aria-label={maskEmails ? 'Show emails' : 'Hide emails'} className="mt-2">
                    {maskEmails ? 'Show Emails' : 'Hide Emails'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Progress Bar and Status */}
          <Separator className="my-6" />
          <div aria-label="Deal Progress" role="progressbar" className="mb-6">
            <h3 className="font-medium mb-3">Deal Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deal.status !== 'pending' ? 'bg-green-600' : 'bg-gray-200'}`}
                    aria-label="Created step"
                  >
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Created</span>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deal.status === 'paid' || deal.status === 'complete' || deal.status === 'resolved' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    aria-label="Paid step"
                  >
                    <DollarSign className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Paid</span>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(deal.status === 'complete' || deal.status === 'resolved') ? 'bg-green-600' : 'bg-gray-200'}`}
                    aria-label="Complete step"
                  >
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <span className="text-xs mt-1 block">Complete</span>
                </div>
              </div>
              <div className="absolute top-4 left-8 right-8 h-1 bg-gray-200">
                <div 
                  className={`h-full ${deal.status === 'pending' ? 'bg-gray-200' : deal.status === 'paid' ? 'bg-blue-600' : (deal.status === 'complete' || deal.status === 'resolved') ? 'bg-green-600' : 'bg-gray-200'}`}
                  style={{ 
                    width: deal.status === 'pending' ? '0%' : deal.status === 'paid' ? '50%' : (deal.status === 'complete' || deal.status === 'resolved') ? '100%' : '0%'
                  }}
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          </div>
          {/* Status Message */}
          <div className="bg-muted/50 p-4 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </div>
          {/* Add dispute button for both buyer and seller */}
          {deal.status !== 'disputed' && (
            <div className="mt-8">
              <AlertDialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full transition hover:scale-105 focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading}
                    aria-label="File Dispute"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
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
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Participants</h3>
            <ul className="list-disc pl-5">
              {participants.map((p, i) => (
                <li key={i} className="text-foreground text-sm">
                  <span className="font-semibold capitalize">{p.role}:</span> {p.email}
                </li>
              ))}
            </ul>
        </div>
      </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-4 mt-4 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => window.location.href = '/'} aria-label="Back to Dashboard" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto">Back to Dashboard</Button>
          <Button variant="outline" onClick={handleDownloadReceipt} disabled={isLoading} aria-label="Download Receipt" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download Receipt'}
          </Button>
          <Button variant="outline" onClick={handleSendReceipt} disabled={isLoading} aria-label="Send Receipt via Email" className="transition hover:scale-105 focus:ring-2 focus:ring-primary/50 w-full md:w-auto">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Receipt via Email'}
          </Button>
        </CardFooter>
      </Card>
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <DealAuditTrail
          dealId={deal.id}
          currentStatus={deal.status}
          buyerEmail={deal.buyerEmail}
          sellerEmail={deal.sellerEmail}
        />
        <DealChat
          dealId={deal.id}
          userEmail={userEmail}
          userRole={userRole}
          buyerEmail={deal.buyerEmail}
          sellerEmail={deal.sellerEmail}
        />
      </div>
    </div>
  );
};

// Add UserIcon for buyer/seller
const UserIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" {...props}><circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0 1 13 0" /></svg>
  );

export default DealStatus;
