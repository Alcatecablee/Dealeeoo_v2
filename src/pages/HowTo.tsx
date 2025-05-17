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
        <p className="text-lg text-muted-foreground text-center max-w-xl">Dealeeoo makes online deals safe and simple for everyone. No account or app needed.</p>
        <p className="text-base text-muted-foreground text-center max-w-xl mt-2">Follow these easy steps to protect your money and your peace of mind.</p>
      </div>
      {/* Glassmorphic Card */}
      <Card className="w-full p-8 glass-card shadow-xl border border-friendly-blue/20 backdrop-blur-md">
        <ol className="space-y-8">
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `0ms` }}>
            <div className="flex flex-col items-center mr-2">
              <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">1</span>
                <span className="sr-only">Step 1</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><FileText className="w-7 h-7 text-friendly-blue" /></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Fill Out Your Deal</h3>
              <p className="text-muted-foreground text-base">Tell us what you're buying or selling, the amount, and the emails of both sides. No account needed.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `80ms` }}>
            <div className="flex flex-col items-center mr-2">
              <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">2</span>
                <span className="sr-only">Step 2</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><LinkIcon className="w-7 h-7 text-friendly-purple" /></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Get a Unique Link</h3>
              <p className="text-muted-foreground text-base">We generate a private link for your deal. Only you and the other party can access it.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `160ms` }}>
            <div className="flex flex-col items-center mr-2">
              <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">3</span>
                <span className="sr-only">Step 3</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Send className="w-7 h-7 text-friendly-green" /></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Share the Link</h3>
              <p className="text-muted-foreground text-base">Send the link to the other person by email, WhatsApp, or any messenger. Both sides use the same link to track the deal.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `240ms` }}>
              <div className="flex flex-col items-center mr-2">
                <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">4</span>
                <span className="sr-only">Step 4</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><UserCheck className="w-7 h-7 text-friendly-yellow" /></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Buyer Pays & Marks as Paid</h3>
              <p className="text-muted-foreground text-base">The buyer sends payment (using your agreed method) and clicks 'Mark as Paid' in Dealeeoo.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `320ms` }}>
            <div className="flex flex-col items-center mr-2">
              <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">5</span>
                <span className="sr-only">Step 5</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Users className="w-7 h-7 text-friendly-blue" /></div>
                </div>
              </div>
              <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Seller Delivers & Marks as Complete</h3>
              <p className="text-muted-foreground text-base">The seller delivers the goods or service, then clicks 'Mark as Complete.' Both sides see real-time updates.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `400ms` }}>
            <div className="flex flex-col items-center mr-2">
              <div className="rounded-full bg-white/80 dark:bg-white/10 shadow-lg p-3 mb-1 border border-border glassy-icon">
                <span className="text-xl font-bold text-gradient-friendly">6</span>
                <span className="sr-only">Step 6</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><CheckCircle2 className="w-7 h-7 text-friendly-green" /></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gradient-friendly">Deal Complete!</h3>
              <p className="text-muted-foreground text-base">Once both sides confirm, the deal is done. If there's a problem, Dealeeoo support can help.</p>
              </div>
            </li>
        </ol>
        {/* Trust Callout */}
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-friendly-blue/10 to-friendly-green/10 border border-friendly-blue/20 flex flex-col gap-2 shadow animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-friendly-green" />
            <span className="font-semibold text-lg text-gradient-friendly">Why trust Dealeeoo?</span>
          </div>
          <ul className="pl-2 space-y-1">
            <li className="flex items-center gap-2 text-base text-foreground">
              <ShieldCheck className="w-5 h-5 text-friendly-green" />
              Escrow protects both buyer and seller.
            </li>
            <li className="flex items-center gap-2 text-base text-foreground">
              <Sparkles className="w-5 h-5 text-friendly-purple" />
              Transparent, real-time status updates.
            </li>
            <li className="flex items-center gap-2 text-base text-foreground">
              <CheckCircle2 className="w-5 h-5 text-friendly-blue" />
              No release until both sides are satisfied.
            </li>
            <li className="flex items-center gap-2 text-base text-foreground">
              <Users className="w-5 h-5 text-friendly-green" />
              Built for real people, not just businesses.
              </li>
          </ul>
        </div>
        {/* Help/Contact */}
        <div className="mt-10 text-muted-foreground text-base border-t pt-6 text-center animate-fade-in">
          <b>Need help?</b> Reach out via the admin dashboard or <a href="/" className="text-friendly-blue underline">contact form</a>.<br />
          <div className="mt-4 font-semibold text-gradient-friendly">Ready to try? <a href="/create-deal" className="underline">Click Create Deal</a> and experience safe, simple transactions.</div>
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