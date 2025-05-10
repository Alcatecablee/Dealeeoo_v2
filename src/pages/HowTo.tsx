import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Link as LinkIcon, Send, FileText, UserCheck, Users, ShieldCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <FileText className="w-7 h-7 text-friendly-blue" />, 
    title: 'Create a Deal',
    desc: "Click 'Create Deal' and fill in the details: title, amount, buyer and seller emails."
  },
  {
    icon: <LinkIcon className="w-7 h-7 text-friendly-purple" />, 
    title: 'Get Your Deal Link',
    desc: "After you submit, you'll get a unique link for this transaction."
  },
  {
    icon: <Send className="w-7 h-7 text-friendly-green" />, 
    title: 'Share the Link',
    desc: "Share your deal link with the other party using email, WhatsApp, or any messaging app. Both sides will use this link to view and confirm the deal."
  },
  {
    icon: <UserCheck className="w-7 h-7 text-friendly-yellow" />, 
    title: 'Buyer Marks as Paid',
    desc: "After making payment (outside Dealeeoo), the buyer clicks 'Mark as Paid.'"
  },
  {
    icon: <Users className="w-7 h-7 text-friendly-blue" />, 
    title: 'Seller Marks as Complete',
    desc: "Once the goods or service have been delivered, the seller clicks 'Mark as Complete.'"
  },
  {
    icon: <CheckCircle2 className="w-7 h-7 text-friendly-green" />, 
    title: 'Deal is Done!',
    desc: "The status updates in real time. Everyone sees what's happening. The admin can help if needed via the dashboard."
  },
];

const trustPoints = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-friendly-green" />,
    text: 'Escrow protects both buyer and seller.'
  },
  {
    icon: <Sparkles className="w-5 h-5 text-friendly-purple" />,
    text: 'Transparent, real-time status updates.'
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-friendly-blue" />,
    text: 'No release until both sides are satisfied.'
  },
];

const HowTo: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 mt-16 max-w-2xl flex flex-col items-center">
      {/* Hero Icon */}
      <div className="mb-6 flex flex-col items-center">
        <ShieldCheck className="w-16 h-16 text-gradient-friendly drop-shadow-lg mb-2 animate-fade-in" />
        <h1 className="text-4xl font-extrabold text-gradient-friendly mb-2 text-center">How Dealeeoo Works</h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl">Safe, simple, and transparent deals in minutes. Here's how to use Dealeeoo for your next transaction.</p>
      </div>
      {/* Glassmorphic Card */}
      <Card className="w-full p-8 glass-card shadow-xl border border-friendly-blue/20 backdrop-blur-md">
        <ol className="space-y-8">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex flex-col items-center mr-2">
                <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                  <span className="text-xl font-bold text-gradient-friendly">{i + 1}</span>
                  <span className="sr-only">Step {i + 1}</span>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{step.icon}</div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-gradient-friendly">{step.title}</h3>
                <p className="text-muted-foreground text-base">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        {/* MVP Payment Info Box */}
        <div className="mt-10 mb-2 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 flex items-start gap-3 text-base text-yellow-800 dark:text-yellow-200 shadow animate-fade-in">
          <span className="mt-0.5 text-2xl">⚠️</span>
          <span>
            <b>Note:</b> For this MVP version, payments are made outside of Dealeeoo (via EFT, PayPal, etc.). In the full version, Dealeeoo will securely hold and release funds through trusted partners like Stripe, Paystack, or Flutterwave.
          </span>
        </div>
        {/* Trust Callout */}
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-friendly-blue/10 to-friendly-green/10 border border-friendly-blue/20 flex flex-col gap-2 shadow animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-friendly-green" />
            <span className="font-semibold text-lg text-gradient-friendly">Why trust Dealeeoo?</span>
          </div>
          <ul className="pl-2 space-y-1">
            {trustPoints.map((point, i) => (
              <li key={i} className="flex items-center gap-2 text-base text-foreground">
                {point.icon}
                {point.text}
              </li>
            ))}
          </ul>
        </div>
        {/* Help/Contact */}
        <div className="mt-10 text-muted-foreground text-base border-t pt-6 text-center animate-fade-in">
          <b>Need help?</b> Reach out via the admin dashboard or <a href="/" className="text-friendly-blue underline">contact form</a>.
        </div>
      </Card>
    </main>
    {/* Animations (add to global CSS if not present) */}
    <style>{`
      .glass-card {
        background: rgba(255,255,255,0.08);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
        border-radius: 1.5rem;
      }
      .glassy-icon {
        position: relative;
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.25);
        backdrop-filter: blur(6px);
      }
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(24px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) both;
      }
      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 1s cubic-bezier(.4,0,.2,1) both;
      }
    `}</style>
  </div>
);

export default HowTo; 