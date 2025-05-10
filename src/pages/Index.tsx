import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Shield, CheckCircle2, PiggyBank, ArrowRight, Sun, Moon, AlertTriangle, Link as LinkIcon, User, Send } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import ColorfulShapes from "@/components/ColorfulShapes";
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WhatsAppChatSimulator from '@/components/WhatsAppChatSimulator';

const faqData = [
  {
    question: "Who holds the money?",
    answer: "Your money is held by regulated payment providers like Stripe, Wise, or Flutterwave — never by Dealeeoo. We just make the process simple and secure."
  },
  {
    question: "Is Dealeeoo an escrow service or a payment app?",
    answer: "We're a trust layer, not a bank. Dealeeoo connects both parties to licensed payment partners and holds the transaction in limbo until both sides are satisfied."
  },
  {
    question: "What happens if there's a dispute?",
    answer: "If there's a conflict, both parties can explain their side. The admin can pause the payout, review proof, and decide fairly — with a clear audit trail."
  },
  {
    question: "Can I use Dealeeoo for international deals?",
    answer: "Yes! Dealeeoo works globally. As long as your country is supported by our payment providers, you're good to go."
  },
  {
    question: "Do I need to create an account?",
    answer: "Nope. You can create a deal and get a unique link in seconds — no signup needed. Want to track your history or access extra features? You can register later."
  },
  {
    question: "How much does it cost?",
    answer: "Please see our Pricing section at the bottom of this page for the latest fees and deal tiers."
  },
  {
    question: "Is Dealeeoo safe for big transactions?",
    answer: "Yes, but we're built for everyday users first. For high-value trades ($3,000+), you might also consider traditional escrow options. Dealeeoo is for the global majority — informal deals, small businesses, and real people."
  },
  {
    question: "Can Dealeeoo be used for services or just products?",
    answer: "Both. Whether you're hiring a freelancer, buying a phone, or trading a domain, Dealeeoo works as long as both parties agree on terms."
  },
  {
    question: "Is this legal? What about compliance?",
    answer: "Yes. We don't touch the money — we work with licensed payment providers who handle all KYC, AML, and regulatory compliance. Dealeeoo acts as a tech facilitator, not a financial institution."
  }
];

function FAQAccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`glass-card bg-white/80 dark:bg-gray-900/80 shadow-lg rounded-2xl transition-all duration-300 border-none ${open ? 'ring-2 ring-friendly-blue/40' : ''}` }>
      <button
        className="w-full flex items-center justify-between py-5 px-6 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="text-lg md:text-xl font-semibold text-friendly-blue text-left">{question}</span>
        <svg className={`ml-4 h-6 w-6 text-friendly-blue transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 px-6 ${open ? 'max-h-40 py-2' : 'max-h-0 py-0'}`}
        style={{ color: '#fdfdfd' }}
      >
        <p className="text-base md:text-lg leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [tab, setTab] = useState('before');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    try {
      const { error } = await supabase.from('waitlist').insert({ email: waitlistEmail });
      if (error) throw error;
      toast.success('You have joined the waitlist!');
      setWaitlistEmail('');
    } catch (err) {
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-24 pt-16 md:pt-28">
        <ColorfulShapes />
        
        <div className="container px-4 mx-auto relative z-10 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="flex-1 flex flex-col gap-4">
              <AnimatedSection delay={0}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] pb-4 mb-6 bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent text-left md:text-left">
                  Trust Made Easy for Online Deals with Strangers
                </h1>
                <p className="text-lg md:text-xl text-friendly-blue font-semibold mb-4">
                  Your money is protected until the deal is done right.
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={150}>
                <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
                  Powered by Stripe, Wise, and other trusted partners to keep your money safe from start to finish.
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={300}>
                <div className="flex flex-wrap gap-6">
                  <Link to="/create-deal">
                    <Button className="bg-gradient-friendly hover:opacity-95 text-xl py-6 px-10 font-bold rounded-2xl shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-friendly-blue/40">
                      Start a Deal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button className="bg-gradient-to-r from-friendly-blue to-friendly-purple text-white text-xl py-6 px-10 shadow-md font-bold rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-friendly-purple/40">
                    Join Waitlist
                  </Button>
                </div>
              </AnimatedSection>
            </div>
            
            <div className="flex-1 mt-12 lg:mt-0 flex justify-center items-center">
              <AnimatedSection delay={450} className="transform lg:translate-x-10">
                <div className="relative w-full max-w-md mx-auto rounded-2xl shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-blue-900/30 overflow-hidden flex items-center justify-center p-4">
                  <img 
                    src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80" 
                    alt="Friendly handshake, trust, safe deal" 
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white/60 dark:bg-gray-900 transition-colors duration-500">
        <div className="container px-4 mx-auto">
          <AnimatedSection delay={300}>
            <h2 className="text-3xl font-bold leading-tight mb-12 text-center bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">How Dealeeoo Works</h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection delay={100}>
              <div className="glass-card bg-white/40 dark:bg-gray-900/60 border border-friendly-blue/30 dark:border-friendly-blue/60 backdrop-blur-lg p-6 rounded-xl text-center shadow-md hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-friendly-blue/10 dark:bg-friendly-blue/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl drop-shadow-glow animate-pulse group-hover:scale-110 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-transform transition-colors" style={{ color: 'var(--color-friendly-blue)' }}>🛠️</span>
                </div>
                <h3 className="text-xl font-semibold leading-tight mb-3 text-friendly-blue dark:text-blue-300">Make a Deal</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Tell us what you're buying or selling and who the deal is with.
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <div className="glass-card bg-white/40 dark:bg-gray-900/60 border border-friendly-purple/30 dark:border-friendly-purple/60 backdrop-blur-lg p-6 rounded-xl text-center shadow-md hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-friendly-purple/10 dark:bg-friendly-purple/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl drop-shadow-glow animate-pulse group-hover:scale-110 group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-transform transition-colors" style={{ color: 'var(--color-friendly-purple)' }}>💸</span>
                </div>
                <h3 className="text-xl font-semibold leading-tight mb-3 text-friendly-purple dark:text-purple-300">Send the Money</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  The buyer pays using our safe payment partner. We'll keep everyone in the loop.
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={300}>
              <div className="glass-card bg-white/40 dark:bg-gray-900/60 border border-friendly-green/30 dark:border-friendly-green/60 backdrop-blur-lg p-6 rounded-xl text-center shadow-md hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-friendly-green/10 dark:bg-friendly-green/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl drop-shadow-glow animate-pulse group-hover:scale-110 group-hover:text-green-400 dark:group-hover:text-green-300 transition-transform transition-colors" style={{ color: 'var(--color-friendly-green)' }}>✅</span>
                </div>
                <h3 className="text-xl font-semibold leading-tight mb-3 text-friendly-green dark:text-green-300">Get What You Paid For</h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Once both sides are happy, the money goes to the seller. Easy and fair.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="about" className="py-16 bg-gradient-to-b from-white to-blue-50/40 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <AnimatedSection delay={0}>
            <div className="glass-card mx-auto p-10 rounded-3xl shadow-2xl border border-blue-200/40 dark:border-blue-900/40 backdrop-blur-lg bg-white/30 dark:bg-gray-900/60 relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-friendly-blue/40 to-friendly-purple/30 dark:from-friendly-blue/20 dark:to-friendly-purple/20 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.15] pb-2 mb-4 bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent drop-shadow-lg">Why Dealeeoo?</h2>
              <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 mb-6 font-semibold">Screenshots won't save you.<br />Dealeeoo holds the money safely so no one gets played.<br />It's peace of mind for online deals.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white/80 dark:bg-gray-950/80 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <AnimatedSection delay={0}>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.15] pb-2 mb-2 text-center bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent drop-shadow-lg">Why Use Dealeeoo?</h2>
            <p className="text-base md:text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              You don't need an account or app — just create a deal and share the link. That's it.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <AnimatedSection delay={100}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-blue/30 dark:border-friendly-blue/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="text-3xl mb-4 drop-shadow-glow">🛡️</span>
                <h3 className="font-bold text-xl leading-tight mb-2 text-friendly-blue dark:text-blue-300">Safe & Secure</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center">We hold the money until both sides confirm. No more scams, no more guesswork.</p>
              </div>
            </AnimatedSection>
            {/* Card 2 */}
            <AnimatedSection delay={200}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-purple/30 dark:border-friendly-purple/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="text-3xl mb-4 drop-shadow-glow">🌍</span>
                <h3 className="font-bold text-xl leading-tight mb-2 text-friendly-purple dark:text-purple-300">Global & Fast</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center">Works anywhere. Real-time deal updates. No apps or logins needed.</p>
              </div>
            </AnimatedSection>
            {/* Card 3 */}
            <AnimatedSection delay={300}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-green/30 dark:border-friendly-green/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="text-3xl mb-4 drop-shadow-glow">✅</span>
                <h3 className="font-bold text-xl leading-tight mb-2 text-friendly-green dark:text-green-300">No Lawyers Needed</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center">No paperwork, no fine print. Just simple, fair deals for everyone.</p>
              </div>
            </AnimatedSection>
            {/* Card 4 */}
            <AnimatedSection delay={400}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-yellow/30 dark:border-yellow-400/40 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="text-3xl mb-4 drop-shadow-glow">😌</span>
                <h3 className="font-bold text-xl leading-tight mb-2 text-yellow-500 dark:text-yellow-300">Peace of Mind</h3>
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center">Both sides are protected. Money only moves when everyone's happy.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Button between Why Use Dealeeoo and How Dealeeoo Stops Scams */}
      <div className="flex justify-center my-12">
        <Link to="/create-deal">
          <Button className="bg-gradient-friendly text-white text-xl px-10 py-5 rounded-2xl font-bold shadow-md hover:opacity-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-friendly-blue/40">
            Start a Deal Now
          </Button>
        </Link>
      </div>

      {/* YC-Ready Anti-Scam Section with Toggle */}
      <section className="py-16 bg-gradient-to-b from-yellow-50/40 to-white/80 dark:from-yellow-900/20 dark:to-gray-950/80 transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-[1.15] pb-2 mb-2 text-gradient-friendly text-center">How We Keep Scams Out of Your Deals</h2>
            <p className="mb-6 text-lg text-muted-foreground text-center max-w-xl">Scammers use pressure tactics, and they move fast.<br />To protect you, we hold the money until both sides say it's all good.</p>
            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-8 bg-white/70 dark:bg-gray-900/70 rounded-xl p-1 border border-border shadow">
              <button onClick={() => setTab('before')} className={`px-6 py-2 rounded-lg font-bold transition-colors ${tab === 'before' ? 'bg-gradient-friendly text-white shadow' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Before Dealeeoo</button>
              <button onClick={() => setTab('after')} className={`px-6 py-2 rounded-lg font-bold transition-colors ${tab === 'after' ? 'bg-gradient-friendly text-white shadow' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'}`}>After Dealeeoo</button>
            </div>
            {/* Tab Content */}
            {tab === 'before' ? (
              <div className="w-[320px] max-w-full mx-auto border-4 border-[#075E54] rounded-3xl overflow-hidden shadow-xl bg-[#E5DDD5] mb-6">
                <div className="bg-[#075E54] text-white p-3 flex items-center">
                  <div className="bg-[#25D366] rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21.54 7.2c.02.16.02.32.02.48 0 4.89-3.72 10.53-10.53 10.53-2.09 0-4.04-.61-5.68-1.66.29.03.57.05.87.05 1.74 0 3.34-.59 4.62-1.59-1.63-.03-3-1.1-3.47-2.57.23.04.47.07.72.07.34 0 .67-.05.98-.13-1.7-.34-2.98-1.85-2.98-3.66v-.05c.5.28 1.08.45 1.7.47a3.67 3.67 0 01-1.63-3.06c0-.67.18-1.3.5-1.84a10.5 10.5 0 007.62 3.87c-.06-.27-.09-.55-.09-.84 0-2.02 1.64-3.66 3.66-3.66 1.05 0 2 .44 2.67 1.15.83-.16 1.6-.47 2.3-.89-.27.85-.85 1.56-1.6 2.01.74-.09 1.45-.28 2.11-.57-.5.74-1.13 1.39-1.86 1.91z" fill="#fff"/></svg>
                  </div>
                  <div>
                    <p className="font-bold">Scammer</p>
                    <p className="text-xs opacity-80">WhatsApp Chat</p>
                  </div>
                </div>
                <div className="h-[340px] p-3 overflow-y-auto flex flex-col space-y-2 bg-[#E5DDD5] bg-opacity-90 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                  {/* Chat bubbles - WhatsApp realistic style */}
                  {/* 1 */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tl-none bg-[#F0FFF0] text-[#222E35] border border-[#B2DFDB] text-base shadow-sm">
                      <span className="font-bold text-red-700"><User className="inline w-4 h-4 mr-1" />Scammer:</span> Hey! I saw your ad for the phone. Is it still available?
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-2">
                      <span className="text-xs text-gray-500">14:01</span>
                    </div>
                  </div>
                  {/* 2 */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tr-none bg-white text-[#222E35] border border-gray-200 text-base shadow-sm">
                      <span className="font-bold text-blue-700"><User className="inline w-4 h-4 mr-1" />Seller:</span> Yes, still brand new. Never used.
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-2">
                      <span className="text-xs text-gray-500">14:02</span>
                      {/* Double gray tick */}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M7 13l3 3 7-7" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15l2 2" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* 3 */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tl-none bg-[#F0FFF0] text-[#222E35] border border-[#B2DFDB] text-base shadow-sm">
                      <span className="font-bold text-red-700"><User className="inline w-4 h-4 mr-1" />Scammer:</span> Great. I'll pay now and send my courier to pick it up.
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-2">
                      <span className="text-xs text-gray-500">14:03</span>
                    </div>
                  </div>
                  {/* 4 */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tr-none bg-white text-[#222E35] border border-gray-200 text-base shadow-sm">
                      <span className="font-bold text-blue-700"><User className="inline w-4 h-4 mr-1" />Seller:</span> Cool. How would you like to pay?
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-2">
                      <span className="text-xs text-gray-500">14:04</span>
                      {/* Double blue tick (read) */}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M7 13l3 3 7-7" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15l2 2" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* 5 */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tl-none bg-[#F0FFF0] text-[#222E35] border border-[#B2DFDB] text-base shadow-sm">
                      <span className="font-bold text-red-700"><User className="inline w-4 h-4 mr-1" />Scammer:</span> I'll send you a secure payment link. Just follow the steps and confirm. <AlertTriangle className="inline w-4 h-4 text-yellow-500 ml-1" />
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-2">
                      <span className="text-xs text-gray-500">14:05</span>
                    </div>
                  </div>
                  {/* 6 */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tr-none bg-white text-[#222E35] border border-gray-200 text-base shadow-sm">
                      <span className="font-bold text-blue-700"><User className="inline w-4 h-4 mr-1" />Seller:</span> Uhh... this link looks strange. Can't you just EFT me?
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-2">
                      <span className="text-xs text-gray-500">14:06</span>
                      {/* Double blue tick (read) */}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M7 13l3 3 7-7" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15l2 2" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* 7 */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tl-none bg-[#F0FFF0] text-[#222E35] border border-[#B2DFDB] text-base shadow-sm">
                      <span className="font-bold text-red-700"><User className="inline w-4 h-4 mr-1" />Scammer:</span> I've used this link for all my payments. It's instant and safe. Trust me.
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-2">
                      <span className="text-xs text-gray-500">14:07</span>
                    </div>
                  </div>
                  {/* 8 */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tr-none bg-white text-[#222E35] border border-gray-200 text-base shadow-sm">
                      <span className="font-bold text-blue-700"><User className="inline w-4 h-4 mr-1" />Seller:</span> I'll wait until the money reflects on my side first.
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-2">
                      <span className="text-xs text-gray-500">14:08</span>
                      {/* Double gray tick */}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline"><path d="M7 13l3 3 7-7" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15l2 2" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* 9 */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tl-none bg-[#F0FFF0] text-[#222E35] border border-[#B2DFDB] text-base shadow-sm">
                      <span className="font-bold text-red-700"><User className="inline w-4 h-4 mr-1" />Scammer:</span> My courier is already on the way. If you delay, I'll cancel and report you for wasting my time.
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-2">
                      <span className="text-xs text-gray-500">14:09</span>
                    </div>
                  </div>
                </div>
                {/* Callout box below chat */}
                <div className="rounded-2xl py-4 px-6 mt-4 mb-2 flex flex-col items-center text-center shadow-lg border border-yellow-500/40" style={{ background: 'rgba(31,31,31,0.85)', boxShadow: '0 0 16px 0 rgba(255, 221, 51, 0.15)' }}>
                  <span className="text-[1.5rem] mb-2">⚠️</span>
                  <div className="font-bold text-base md:text-lg mb-2 text-white">This is how people get scammed every day.</div>
                  <div className="text-white text-sm md:text-base font-medium leading-snug">
                    Dealeeoo protects your money.<br />
                    No fake links. No pressure. No risk.<br />
                    We hold the funds. You deliver only when it's real.
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-border mb-6">
                <h3 className="text-2xl font-bold leading-tight mb-4 text-gradient-friendly text-center">After Dealeeoo</h3>
                <ol className="space-y-6 w-full max-w-xs mx-auto">
                  <li className="flex items-center gap-3">
                    <span className="bg-gradient-friendly text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                    <span className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-friendly-blue" />Create Deal</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-gradient-friendly text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                    <span className="font-semibold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-friendly-purple" />Share Link</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-gradient-friendly text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                    <span className="font-semibold flex items-center gap-2"><Send className="w-5 h-5 text-friendly-green" />Buyer Pays (Escrow)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-gradient-friendly text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
                    <span className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-friendly-yellow" />Both Confirm → Money Released</span>
                  </li>
                </ol>
                <div className="mt-8 mb-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-200 text-center">
                  <b>Dealeeoo = No fake links. No pressure. No risk.</b><br />
                  Your money is safe until you say so.
                </div>
                <a href="/create-deal" className="mt-4 bg-gradient-friendly text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition text-lg text-center w-full block">Protect Your Next Deal with Dealeeoo</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-b from-blue-50/40 to-white/80 dark:from-gray-900/60 dark:to-gray-950/80 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <AnimatedSection delay={0}>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.15] pb-2 mb-12 text-center bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent drop-shadow-lg">What Our Users Say</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection delay={100}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-blue/30 dark:border-friendly-blue/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="absolute -top-6 -left-6 w-20 h-20 bg-friendly-blue/30 dark:bg-friendly-blue/20 rounded-full blur-2xl opacity-50 animate-pulse"></span>
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-20 h-20 rounded-full mb-4 border-4 border-friendly-blue/30 dark:border-friendly-blue/60 shadow-lg" />
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (<svg key={i} className="w-6 h-6 text-yellow-400 drop-shadow-glow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>))}
                </div>
                <p className="text-gray-800 dark:text-gray-100 font-semibold mb-2">"I sold my laptop to a stranger and got paid safely. Dealeeoo is a game changer!"</p>
                <span className="font-bold text-friendly-blue dark:text-blue-300">James K.</span>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-purple/30 dark:border-friendly-purple/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="absolute -top-6 -right-6 w-20 h-20 bg-friendly-purple/30 dark:bg-friendly-purple/20 rounded-full blur-2xl opacity-50 animate-pulse"></span>
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-20 h-20 rounded-full mb-4 border-4 border-friendly-purple/30 dark:border-friendly-purple/60 shadow-lg" />
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (<svg key={i} className="w-6 h-6 text-yellow-400 drop-shadow-glow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>))}
                </div>
                <p className="text-gray-800 dark:text-gray-100 font-semibold mb-2">"I never worry about getting scammed anymore. The process is so easy!"</p>
                <span className="font-bold text-friendly-purple dark:text-purple-300">Aisha M.</span>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <div className="glass-card p-8 rounded-3xl shadow-xl border border-friendly-green/30 dark:border-friendly-green/60 backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden">
                <span className="absolute -bottom-6 -left-6 w-20 h-20 bg-friendly-green/30 dark:bg-friendly-green/20 rounded-full blur-2xl opacity-50 animate-pulse"></span>
                <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="User" className="w-20 h-20 rounded-full mb-4 border-4 border-friendly-green/30 dark:border-friendly-green/60 shadow-lg" />
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (<svg key={i} className="w-6 h-6 text-yellow-400 drop-shadow-glow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>))}
                </div>
                <p className="text-gray-800 dark:text-gray-100 font-semibold mb-2">"Perfect for freelancers and remote work. I get paid on time, every time."</p>
                <span className="font-bold text-friendly-green dark:text-green-300">Samuel O.</span>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-gradient-to-b from-white to-blue-50/40 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold leading-[1.15] pb-2 mb-10 text-center bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">Frequently Asked Questions</h2>
          </AnimatedSection>
          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <FAQAccordionItem key={idx} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50/40 dark:from-gray-900 dark:to-gray-950 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <AnimatedSection delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold leading-[1.15] pb-2 mb-4 text-center bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">Simple and Affordable Pricing</h2>
            <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Built for the Global Majority, not the Elite.<br />
              No subscriptions. No setup fees. Just honest pricing for real people, moving real value, in real conversations.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {/* Tier 1 */}
            <AnimatedSection delay={100}>
              <div className="glass-card p-8 rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg hover:scale-105 transition-all duration-300 flex flex-col h-full border-none">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🛠️</span>
                  <h3 className="font-bold text-xl leading-tight text-friendly-blue">Hustler</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">1%</span>
                  <span className="text-muted-foreground"> flat fee</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">For hustlers, side gigs, and small swaps</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Deal Range:</span>
                    <span className="font-medium">$0 - $100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Example:</span>
                    <span className="font-medium">$50 = $0.50 fee</span>
                  </div>
                </div>
                <Link to="/create-deal" className="block w-full text-center bg-gradient-friendly text-white py-2 rounded-lg font-medium hover:opacity-90 transition mt-auto">
                  Start a Deal
                </Link>
              </div>
            </AnimatedSection>

            {/* Tier 2 */}
            <AnimatedSection delay={200}>
              <div className="glass-card p-8 rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg hover:scale-105 transition-all duration-300 flex flex-col h-full border-none">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💼</span>
                  <h3 className="font-bold text-xl leading-tight text-friendly-purple">Freelancer</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">2%</span>
                  <span className="text-muted-foreground"> flat fee</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">For freelancers, ecom traders, and service providers</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Deal Range:</span>
                    <span className="font-medium">$101 - $3,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Example:</span>
                    <span className="font-medium">$1,000 = $20 fee</span>
                  </div>
                </div>
                <Link to="/create-deal" className="block w-full text-center bg-gradient-friendly text-white py-2 rounded-lg font-medium hover:opacity-90 transition mt-auto">
                  Start a Deal
                </Link>
              </div>
            </AnimatedSection>

            {/* Tier 3 */}
            <AnimatedSection delay={300}>
              <div className="glass-card p-8 rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg hover:scale-105 transition-all duration-300 flex flex-col h-full border-none">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🚛</span>
                  <h3 className="font-bold text-xl leading-tight text-friendly-green">Business</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">3%</span>
                  <span className="text-muted-foreground"> flat fee</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">For business deals, bulk goods, and premium projects</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Deal Range:</span>
                    <span className="font-medium">$3,001 - $10,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Example:</span>
                    <span className="font-medium">$5,000 = $150 fee</span>
                  </div>
                </div>
                <Link to="/create-deal" className="block w-full text-center bg-gradient-friendly text-white py-2 rounded-lg font-medium hover:opacity-90 transition mt-auto">
                  Start a Deal
                </Link>
              </div>
            </AnimatedSection>

            {/* Tier 4 */}
            <AnimatedSection delay={400}>
              <div className="glass-card p-8 rounded-2xl shadow-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg hover:scale-105 transition-all duration-300 flex flex-col h-full border-none">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏦</span>
                  <h3 className="font-bold text-xl leading-tight text-friendly-yellow">Enterprise</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">4%</span>
                  <span className="text-muted-foreground"> flat fee</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">For high-stakes deals, property, cars, and assets</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Deal Range:</span>
                    <span className="font-medium">$10,001+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Example:</span>
                    <span className="font-medium">$15,000 = $600 fee</span>
                  </div>
                </div>
                <Link to="/create-deal" className="block w-full text-center bg-gradient-friendly text-white py-2 rounded-lg font-medium hover:opacity-90 transition mt-auto">
                  Start a Deal
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Waitlist Section above footer */}
      <div className="container mx-auto px-4 max-w-7xl flex flex-col items-center justify-center py-12 mb-12">
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-10 shadow-xl flex flex-col items-center backdrop-blur-lg border border-white/20 dark:border-blue-900/30 w-full relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 text-gradient-friendly">Join the Waitlist</h2>
          <p className="text-muted-foreground mb-6 text-center">Get early access and updates. Enter your email below:</p>
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 px-5 py-3 rounded-xl border-none bg-white/90 dark:bg-gray-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-friendly-blue/40 shadow-sm transition-all"
              value={waitlistEmail}
              onChange={e => setWaitlistEmail(e.target.value)}
              disabled={waitlistLoading}
            />
            <button
              type="submit"
              className="bg-gradient-friendly text-white px-8 py-3 rounded-2xl font-bold shadow-md hover:opacity-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-friendly-blue/40"
              disabled={waitlistLoading}
            >
              {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
        </div>
      </div>

      {/* Payments Powered By Banner */}
      <section className="container mx-auto px-4 max-w-7xl flex flex-col items-center justify-center py-12 mb-12">
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-10 shadow-xl flex flex-col items-center backdrop-blur-lg border border-white/20 dark:border-blue-900/30 w-full relative overflow-hidden">
          <h3 className="text-center text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-8 tracking-wide drop-shadow-glow relative z-10">Payments powered by</h3>
          <div className="relative w-full">
            {/* Gradient edge masks - subtle, transparent to bg */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 z-10" style={{background: 'linear-gradient(to right, rgba(255,255,255,0.12) 60%, transparent 100%)'}}></div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-6 z-10" style={{background: 'linear-gradient(to left, rgba(255,255,255,0.12) 60%, transparent 100%)'}}></div>
            {/* Marquee */}
            <div className="overflow-hidden w-full pl-12 pr-12">
              <div className="flex items-center gap-16 min-w-[200%] animate-marquee group hover:[animation-play-state:paused]" style={{animationDuration: '32s', minHeight: '64px'}}>
                {/* LOGOS - only show the 5 you want, no grayscale */}
                {[
                  { src: '/logos/stripe.svg', alt: 'Stripe' },
                  { src: '/logos/wise.svg', alt: 'Wise' },
                  { src: '/logos/flutterwave.svg', alt: 'Flutterwave' },
                  { src: '/logos/paystack.svg', alt: 'Paystack' },
                  { src: '/logos/payoneer.svg', alt: 'Payoneer' },
                ].map((logo, i) => (
                  <img
                    key={i}
                    src={logo.src}
                    alt={logo.alt}
                    className="h-14 md:h-16 max-h-20 opacity-95 hover:opacity-100 transition-all drop-shadow-glow mx-6 relative z-10"
                    style={{ minWidth: 120, objectFit: 'contain' }}
                  />
                ))}
                {/* Repeat logos for seamless loop */}
                {[
                  { src: '/logos/stripe.svg', alt: 'Stripe' },
                  { src: '/logos/wise.svg', alt: 'Wise' },
                  { src: '/logos/flutterwave.svg', alt: 'Flutterwave' },
                  { src: '/logos/paystack.svg', alt: 'Paystack' },
                  { src: '/logos/payoneer.svg', alt: 'Payoneer' },
                ].map((logo, i) => (
                  <img
                    key={i + 100}
                    src={logo.src}
                    alt={logo.alt}
                    className="h-14 md:h-16 max-h-20 opacity-95 hover:opacity-100 transition-all drop-shadow-glow mx-6 relative z-10"
                    style={{ minWidth: 120, objectFit: 'contain' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
          will-change: transform;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { background: #0c0c0f; }
      `}</style>

      {/* Footer */}
      <footer className="bg-[#0c0c0f] border-t-0 py-10 mt-0">
        <div className="container mx-auto px-4 max-w-3xl flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">Dealeeoo</span>
              <span className="text-muted-foreground text-base">&copy; {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <nav className="flex gap-8 text-lg font-semibold">
              <a href="#about" className="hover:text-friendly-blue transition">About</a>
              <a href="#how" className="hover:text-friendly-blue transition">How it Works</a>
              <a href="#faq" className="hover:text-friendly-blue transition">FAQ</a>
              <a href="#contact" className="hover:text-friendly-blue transition">Contact</a>
            </nav>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-friendly-blue"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 012 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 007.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0024 4.59a8.36 8.36 0 01-2.54.7z" fill="currentColor"/></svg></a>
              <a href="#" className="text-muted-foreground hover:text-friendly-purple"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.6 8.07 8.24 8.93.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.54-1.37-1.32-1.74-1.32-1.08-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.23 1.23 1.06 1.82 2.78 1.3 3.46.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.97 0-1.32.47-2.4 1.23-3.25-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.85 1.23 1.93 1.23 3.25 0 4.64-2.8 5.67-5.47 5.97.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.36 20.07 24 16.41 24 12c0-5.5-4.46-9.96-9.96-9.96z" fill="currentColor"/></svg></a>
              <a href="#" className="text-muted-foreground hover:text-friendly-green"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21.54 7.2c.02.16.02.32.02.48 0 4.89-3.72 10.53-10.53 10.53-2.09 0-4.04-.61-5.68-1.66.29.03.57.05.87.05 1.74 0 3.34-.59 4.62-1.59-1.63-.03-3-1.1-3.47-2.57.23.04.47.07.72.07.34 0 .67-.05.98-.13-1.7-.34-2.98-1.85-2.98-3.66v-.05c.5.28 1.08.45 1.7.47a3.67 3.67 0 01-1.63-3.06c0-.67.18-1.3.5-1.84a10.5 10.5 0 007.62 3.87c-.06-.27-.09-.55-.09-.84 0-2.02 1.64-3.66 3.66-3.66 1.05 0 2 .44 2.67 1.15.83-.16 1.6-.47 2.3-.89-.27.85-.85 1.56-1.6 2.01.74-.09 1.45-.28 2.11-.57-.5.74-1.13 1.39-1.86 1.91z" fill="currentColor"/></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
