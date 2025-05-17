import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateDealInput } from '@/types/deal';
import dealService from '@/lib/api';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Sparkles, ArrowLeft, Info, CheckCircle2, Circle, HelpCircle, Search, Filter } from 'lucide-react';
import AIDealAdvisor from '@/components/AIDealAdvisor';
import Header from '@/components/Header';
import SuccessModal from '@/components/SuccessModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AnimatedSection from '@/components/AnimatedSection';

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  buyerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  sellerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  template: z.string().optional(),
  notes: z.string().optional(),
});

// Expanded template data
const TEMPLATES = [
  // Recommended (Custom Deal first)
  { id: 'custom', category: 'Recommended', emoji: '✨', title: 'Custom Deal', desc: 'Create your own deal for anything you need.' },
  { id: 'recommended-crypto', category: 'Recommended', emoji: '💱', title: 'Crypto Deal', desc: 'Securely swap or trade crypto assets.' },
  { id: 'recommended-domain', category: 'Recommended', emoji: '🌍', title: 'Domain Transfer', desc: 'Transfer domain ownership safely.' },
  { id: 'recommended-freelance', category: 'Recommended', emoji: '💼', title: 'Freelance Payment', desc: 'Pay freelancers with escrow protection.' },

  // Crypto Deals
  { id: 'stablecoin', category: 'Crypto Deals', emoji: '💵', title: 'Stablecoin Swap', desc: 'Swap USDT, USDC, or other stablecoins securely.' },
  { id: 'token-sale', category: 'Crypto Deals', emoji: '🪙', title: 'Token Sale', desc: 'Participate in token pre-sales or launches.' },
  { id: 'cross-chain', category: 'Crypto Deals', emoji: '🔗', title: 'Cross-Chain Bridge', desc: 'Bridge assets between blockchains.' },
  { id: 'nft-market', category: 'Crypto Deals', emoji: '🖼️', title: 'NFT Marketplace Escrow', desc: 'Trade NFTs with escrow protection.' },
  { id: 'otc', category: 'Crypto Deals', emoji: '🤝', title: 'OTC Trade', desc: 'Over-the-counter crypto deals.' },

  // Digital Work
  { id: 'content', category: 'Digital Work', emoji: '✍️', title: 'Content Creation', desc: 'Hire writers for blogs, articles, and more.' },
  { id: 'video', category: 'Digital Work', emoji: '🎬', title: 'Video Production', desc: 'Commission video editing or production.' },
  { id: 'graphic', category: 'Digital Work', emoji: '🎨', title: 'Graphic Design', desc: 'Get logos, banners, and graphics designed.' },
  { id: 'software', category: 'Digital Work', emoji: '💻', title: 'Software Development', desc: 'Web, app, or custom software projects.' },
  { id: 'voiceover', category: 'Digital Work', emoji: '🎤', title: 'Voice-over Recording', desc: 'Professional voice talent for your project.' },
  { id: 'translation', category: 'Digital Work', emoji: '🌐', title: 'Translation Services', desc: 'Translate documents or content.' },
  { id: 'uxui', category: 'Digital Work', emoji: '🖌️', title: 'UX/UI Design', desc: 'User experience and interface design.' },

  // Escrow Services
  { id: 'realestate', category: 'Escrow Services', emoji: '🏠', title: 'Real Estate', desc: 'Rent, buy, or sell property with escrow.' },
  { id: 'auto', category: 'Escrow Services', emoji: '🚗', title: 'Automotive Sale', desc: 'Buy or sell cars and motorbikes.' },
  { id: 'equipment-lease', category: 'Escrow Services', emoji: '🔧', title: 'Equipment Leasing', desc: 'Lease tools, cameras, or equipment.' },
  { id: 'art', category: 'Escrow Services', emoji: '🖼️', title: 'Art & Collectibles', desc: 'Buy or sell art and collectibles.' },

  // Subscription & Licenses
  { id: 'saas', category: 'Subscription & Licenses', emoji: '🔑', title: 'SaaS License', desc: 'Annual or monthly software licenses.' },
  { id: 'domain-reg', category: 'Subscription & Licenses', emoji: '🌐', title: 'Domain Name Registration', desc: 'Register or transfer a domain name.' },
  { id: 'software-key', category: 'Subscription & Licenses', emoji: '🗝️', title: 'Software Activation Key', desc: 'Buy or sell software keys.' },
  { id: 'membership', category: 'Subscription & Licenses', emoji: '🎫', title: 'Membership Subscription', desc: 'Clubs, gyms, or online memberships.' },

  // Digital Goods
  { id: 'nft-trade', category: 'Digital Goods', emoji: '🖼️', title: 'NFT Trade', desc: 'Trade NFT art or collectibles.' },
  { id: 'ebook', category: 'Digital Goods', emoji: '📚', title: 'E-book Delivery', desc: 'Sell or buy e-books securely.' },
  { id: 'course', category: 'Digital Goods', emoji: '🎓', title: 'Online Course Access', desc: 'Access to online learning content.' },
  { id: 'digital-bundle', category: 'Digital Goods', emoji: '📦', title: 'Digital Asset Bundle', desc: 'Sell or buy digital asset packages.' },

  // Services & Events
  { id: 'event-ticket', category: 'Services & Events', emoji: '🎟️', title: 'Event Tickets', desc: 'Concerts, sports, or show tickets.' },
  { id: 'workshop', category: 'Services & Events', emoji: '🧑‍🏫', title: 'Workshop/Training', desc: 'Book workshops or training sessions.' },
  { id: 'photo', category: 'Services & Events', emoji: '📸', title: 'Photography Session', desc: 'Book a photographer for your event.' },
  { id: 'catering', category: 'Services & Events', emoji: '🍽️', title: 'Catering Services', desc: 'Hire catering for events.' },
  { id: 'venue', category: 'Services & Events', emoji: '🏢', title: 'Venue Rental', desc: 'Rent venues for events or meetings.' },

  // General Goods
  { id: 'electronics', category: 'General Goods', emoji: '📱', title: 'Electronics Sale', desc: 'Phones, laptops, and gadgets.' },
  { id: 'fashion', category: 'General Goods', emoji: '👗', title: 'Fashion Resale', desc: 'Designer or streetwear resale.' },
  { id: 'appliances', category: 'General Goods', emoji: '🧊', title: 'Home Appliances', desc: 'Buy or sell appliances.' },
  { id: 'furniture', category: 'General Goods', emoji: '🛋️', title: 'Furniture Purchase', desc: 'Buy or sell furniture.' },
  { id: 'handmade', category: 'General Goods', emoji: '🧶', title: 'Handmade Crafts', desc: 'Unique, handmade items.' },

  // Financial & Loans
  { id: 'loan', category: 'Financial & Loans', emoji: '💸', title: 'Personal Loan', desc: 'Disburse or receive a personal loan.' },
  { id: 'p2p-lending', category: 'Financial & Loans', emoji: '🤝', title: 'Peer-to-Peer Lending', desc: 'Lend or borrow money securely.' },
  { id: 'crowdfunding', category: 'Financial & Loans', emoji: '🤲', title: 'Crowdfunding Pledge', desc: 'Release funds for crowdfunding.' },
  { id: 'invoice', category: 'Financial & Loans', emoji: '🧾', title: 'Invoice Financing', desc: 'Finance invoices for cash flow.' },

  // Rental & Leasing
  { id: 'vehicle-rental', category: 'Rental & Leasing', emoji: '🚙', title: 'Vehicle Rental', desc: 'Rent cars, bikes, or scooters.' },
  { id: 'equipment-rental', category: 'Rental & Leasing', emoji: '🔨', title: 'Equipment Rental', desc: 'Rent tools, cameras, or gear.' },
  { id: 'vacation', category: 'Rental & Leasing', emoji: '🏖️', title: 'Vacation Home Rental', desc: 'Book vacation homes.' },
  { id: 'wfh-space', category: 'Rental & Leasing', emoji: '🏢', title: 'Work-from-Home Space', desc: 'Lease a workspace or office.' },

  // Professional Services
  { id: 'legal', category: 'Professional Services', emoji: '⚖️', title: 'Legal Retainer', desc: 'Hold funds for legal services.' },
  { id: 'consulting', category: 'Professional Services', emoji: '👔', title: 'Consulting Fees', desc: 'Pay for consulting or advisory.' },
  { id: 'accounting', category: 'Professional Services', emoji: '📊', title: 'Accounting & Tax', desc: 'Accounting or tax preparation.' },
  { id: 'medical', category: 'Professional Services', emoji: '🩺', title: 'Medical Second Opinion', desc: 'Get a second opinion from a doctor.' },

  // Logistic & Supply
  { id: 'wholesale', category: 'Logistic & Supply', emoji: '🚚', title: 'Wholesale Purchase', desc: 'Bulk purchase orders.' },
  { id: 'supply-chain', category: 'Logistic & Supply', emoji: '🔗', title: 'Supply Chain Milestone', desc: 'Pay on supply chain milestones.' },
  { id: 'import-export', category: 'Logistic & Supply', emoji: '🛳️', title: 'Import/Export Goods', desc: 'International goods transfer.' },

  // Education & Coaching
  { id: 'tutoring', category: 'Education & Coaching', emoji: '📖', title: 'Tutoring Session', desc: 'Book a tutor for any subject.' },
  { id: 'coaching', category: 'Education & Coaching', emoji: '🎯', title: 'Career Coaching', desc: 'Career or life coaching packages.' },
  { id: 'certification', category: 'Education & Coaching', emoji: '📜', title: 'Certification Prep', desc: 'Exam or certification preparation.' },

  // Charitable & Community
  { id: 'donation', category: 'Charitable & Community', emoji: '🤲', title: 'Donation Release', desc: 'Release donations on milestones.' },
  { id: 'grant', category: 'Charitable & Community', emoji: '🎁', title: 'Grant Disbursement', desc: 'Disburse grant funds.' },
  { id: 'scholarship', category: 'Charitable & Community', emoji: '🎓', title: 'Scholarship Fund', desc: 'Release scholarship funds.' },
];

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'Goods', label: 'Goods' },
  { key: 'Freelance', label: 'Freelance Work' },
  { key: 'Services', label: 'Service Contracts' },
  { key: 'Crypto', label: 'Crypto & Digital' },
  { key: 'Domains', label: 'Domains & Digital Assets' },
  { key: 'Vehicles', label: 'Vehicles' },
  { key: 'Property', label: 'Property' },
  { key: 'Events', label: 'Events & Tickets' },
  { key: 'Other', label: 'Other' },
];

// Expanded sections for new categories
const SECTIONS = [
  { key: 'recommended', label: 'Recommended for You' },
  { key: 'crypto-deals', label: 'Crypto Deals' },
  { key: 'digital-work', label: 'Digital Work' },
  { key: 'escrow-services', label: 'Escrow Services' },
  { key: 'subscription-licenses', label: 'Subscription & Licenses' },
  { key: 'digital-goods', label: 'Digital Goods' },
  { key: 'services-events', label: 'Services & Events' },
  { key: 'general-goods', label: 'General Goods' },
  { key: 'financial-loans', label: 'Financial & Loans' },
  { key: 'rental-leasing', label: 'Rental & Leasing' },
  { key: 'professional-services', label: 'Professional Services' },
  { key: 'logistic-supply', label: 'Logistic & Supply' },
  { key: 'education-coaching', label: 'Education & Coaching' },
  { key: 'charitable-community', label: 'Charitable & Community' },
];

// Pricing plans
const PRICING_PLANS = [
  {
    key: 'hustler',
    name: 'Hustler',
    emoji: '🛠️',
    percent: 1,
    min: 0,
    max: 100,
    desc: 'For hustlers, side gigs, and small swaps',
    example: '$50 = $0.50 fee',
  },
  {
    key: 'freelancer',
    name: 'Freelancer',
    emoji: '💼',
    percent: 2,
    min: 101,
    max: 3000,
    desc: 'For freelancers, ecom traders, and service providers',
    example: '$1,000 = $20 fee',
  },
  {
    key: 'business',
    name: 'Business',
    emoji: '📈',
    percent: 3,
    min: 3001,
    max: 10000,
    desc: 'For business deals, bulk goods, and premium projects',
    example: '$5,000 = $150 fee',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    emoji: '🏛️',
    percent: 4,
    min: 10001,
    max: Infinity,
    desc: 'For high-stakes deals, property, cars, and assets',
    example: '$15,000 = $600 fee',
  },
];

function getPricingPlan(amount: number) {
  if (isNaN(amount) || amount <= 0) return PRICING_PLANS[0];
  return PRICING_PLANS.find(plan => amount >= plan.min && amount <= plan.max) || PRICING_PLANS[PRICING_PLANS.length - 1];
}

const PricingPlanModal = ({ open, onClose, onSelect }: { open: boolean, onClose: () => void, onSelect: (planKey: string) => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl w-full bg-background rounded-2xl p-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold mb-2 text-center">Choose a Pricing Plan</DialogTitle>
        <p className="text-muted-foreground text-center mb-6">Pick the plan that fits your deal. You can also let us auto-assign based on your amount.</p>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map(plan => (
          <div key={plan.key} className="bg-muted rounded-2xl p-6 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer" onClick={() => onSelect(plan.key)}>
            <div className="text-3xl mb-2">{plan.emoji}</div>
            <div className="font-bold text-lg mb-1" style={{ color: plan.key === 'hustler' ? '#3b82f6' : plan.key === 'freelancer' ? '#a78bfa' : plan.key === 'business' ? '#34d399' : '#fbbf24' }}>{plan.name}</div>
            <div className="text-2xl font-bold mb-1">{plan.percent}% <span className="text-base font-normal">flat fee</span></div>
            <div className="text-sm text-muted-foreground mb-2 text-center">{plan.desc}</div>
            <div className="text-xs text-muted-foreground mb-1">Deal Range: ${plan.min.toLocaleString()} - {plan.max === Infinity ? '$10,000+' : `$${plan.max.toLocaleString()}`}</div>
            <div className="text-xs text-muted-foreground mb-2">Example: {plan.example}</div>
            <button className="mt-auto px-4 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition">Choose</button>
          </div>
        ))}
      </div>
      <DialogFooter>
        <button className="px-4 py-2 rounded-full bg-muted text-white font-semibold hover:bg-muted/80 transition" onClick={onClose}>Cancel</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Expanded border gradients for new categories
const CATEGORY_BORDER_GRADIENTS: Record<string, string> = {
  'Recommended': 'border-[1.5px] border-indigo-400/60',
  'Crypto Deals': 'border-[1.5px] border-pink-400/60',
  'Digital Work': 'border-[1.5px] border-blue-400/60',
  'Escrow Services': 'border-[1.5px] border-green-400/60',
  'Subscription & Licenses': 'border-[1.5px] border-purple-400/60',
  'Digital Goods': 'border-[1.5px] border-yellow-400/60',
  'Services & Events': 'border-[1.5px] border-orange-400/60',
  'General Goods': 'border-[1.5px] border-cyan-400/60',
  'Financial & Loans': 'border-[1.5px] border-rose-400/60',
  'Rental & Leasing': 'border-[1.5px] border-teal-400/60',
  'Professional Services': 'border-[1.5px] border-fuchsia-400/60',
  'Logistic & Supply': 'border-[1.5px] border-lime-400/60',
  'Education & Coaching': 'border-[1.5px] border-emerald-400/60',
  'Charitable & Community': 'border-[1.5px] border-violet-400/60',
};

// Filters for the filter bar, matching SECTIONS
const FILTERS = [
  { key: 'all', label: 'All' },
  ...SECTIONS.map(s => ({ key: s.key, label: s.label })),
];

// Add supported currency symbols
const CURRENCY_OPTIONS = [
  { symbol: '$', label: 'USD' },
  { symbol: '€', label: 'EUR' },
  { symbol: '£', label: 'GBP' },
  { symbol: 'R', label: 'ZAR' },
];

const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [manualPlan, setManualPlan] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currency, setCurrency] = useState('$');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      buyerEmail: "",
      sellerEmail: "",
      template: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const buyerToken = uuidv4();
      const sellerToken = uuidv4();

      const dealInput: CreateDealInput = {
        ...values,
        buyer_access_token: buyerToken,
        seller_access_token: sellerToken,
      };

      const newDeal = await dealService.createDeal(dealInput);
      setCreatedDealId(newDeal.id);
      setShowSuccessModal(true);
      setShowReview(false);
      // Store the seller's token with their email for immediate access if they created it
      // This helps if they navigate directly to the deal page from the success modal
      localStorage.setItem('userEmail', values.sellerEmail); 
      localStorage.setItem(`dealToken_${newDeal.id}_${values.sellerEmail}`, sellerToken);


      try {
        await fetch('http://localhost:3001/api/send-deal-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerEmail: values.buyerEmail,
            sellerEmail: values.sellerEmail,
            dealId: newDeal.id,
            buyerToken: buyerToken,
            sellerToken: sellerToken,
            // dealLink: window.location.origin + '/deal/' + newDeal.id, // Keep for now, will be replaced by backend
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send deal email:', emailErr);
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Failed to create deal. Please try again.");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      form.setValue('title', template.title);
      form.setValue('description', template.desc);
      form.setValue('amount', 0);
    }
  };

  const handleAISuggestionSelect = (suggestion: string) => {
    const lines = suggestion.split('\n\n');
    if (lines.length >= 2) {
      form.setValue('title', lines[0], { shouldValidate: true });
      form.setValue('description', lines[1], { shouldValidate: true });
    } else {
      form.setValue('description', suggestion, { shouldValidate: true });
    }
    setShowAiAdvisor(false);
    toast.success("AI suggestion applied!");
  };

  // Update getTemplates to match new section keys
  const getTemplates = (sectionKey: string) => {
    switch (sectionKey) {
      case 'recommended':
        return TEMPLATES.filter(t => t.category === 'Recommended');
      case 'crypto-deals':
        return TEMPLATES.filter(t => t.category === 'Crypto Deals');
      case 'digital-work':
        return TEMPLATES.filter(t => t.category === 'Digital Work');
      case 'escrow-services':
        return TEMPLATES.filter(t => t.category === 'Escrow Services');
      case 'subscription-licenses':
        return TEMPLATES.filter(t => t.category === 'Subscription & Licenses');
      case 'digital-goods':
        return TEMPLATES.filter(t => t.category === 'Digital Goods');
      case 'services-events':
        return TEMPLATES.filter(t => t.category === 'Services & Events');
      case 'general-goods':
        return TEMPLATES.filter(t => t.category === 'General Goods');
      case 'financial-loans':
        return TEMPLATES.filter(t => t.category === 'Financial & Loans');
      case 'rental-leasing':
        return TEMPLATES.filter(t => t.category === 'Rental & Leasing');
      case 'professional-services':
        return TEMPLATES.filter(t => t.category === 'Professional Services');
      case 'logistic-supply':
        return TEMPLATES.filter(t => t.category === 'Logistic & Supply');
      case 'education-coaching':
        return TEMPLATES.filter(t => t.category === 'Education & Coaching');
      case 'charitable-community':
        return TEMPLATES.filter(t => t.category === 'Charitable & Community');
      default:
        return [];
    }
  };

  // Only show sections matching the filter
  const visibleSections = activeFilter === 'all'
    ? SECTIONS
    : SECTIONS.filter(s => s.key === activeFilter);

  // Pricing plan logic
  const amount = Number(form.watch('amount'));
  const autoPlan = getPricingPlan(amount);
  const plan = manualPlan ? PRICING_PLANS.find(p => p.key === manualPlan) || autoPlan : autoPlan;
  const fee = amount > 0 ? (amount * plan.percent) / 100 : 0;

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Create New Deal</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Set up your secure transaction by choosing a template below. Both parties will be notified.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === f.key ? 'bg-primary text-white shadow' : 'bg-muted text-muted-foreground hover:bg-primary/20'}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-center mb-10 gap-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              className="w-full rounded-full bg-muted px-4 py-2 pl-10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="Search templates (e.g. iPhone, logo, crypto...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
          </div>
          <button className="ml-2 px-4 py-2 rounded-full bg-primary text-white flex items-center gap-2 shadow hover:bg-primary/90 transition">
            <Sparkles className="w-4 h-4" /> AI Suggest
          </button>
          </div>
          
        {/* Sections (filtered) */}
        <div className="space-y-16">
          {visibleSections.map((section, sectionIdx) => {
            let templates = getTemplates(section.key);
            if (search) {
              templates = templates.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.desc.toLowerCase().includes(search.toLowerCase())
              );
            }
            if (!templates.length) return null;
            return (
              <div key={section.key} className="mb-2">
                <h2 className="text-2xl font-bold mb-8 ml-2 text-gradient-friendly drop-shadow-lg">{section.label}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {templates.map((t, i) => (
                    <AnimatedSection key={t.id} delay={i * 80}>
                      <div
                        className={`glass-card p-8 rounded-3xl shadow-xl backdrop-blur-lg bg-white/40 dark:bg-gray-900/60 flex flex-col items-center hover:scale-105 transition-transform transition-colors duration-500 group relative overflow-hidden cursor-pointer min-h-[320px] max-w-xs mx-auto ${selected === t.id ? 'ring-4 ring-primary' : ''} ${CATEGORY_BORDER_GRADIENTS[t.category] || 'border-[1.5px] border-blue-200/40'}`}
                        onClick={() => {
                          setSelected(t.id);
                          handleTemplateSelect(t.id);
                          setShowReview(true);
                        }}
                        style={{ flex: '0 0 auto' }}
                      >
                        <div className="w-16 h-16 rounded-full bg-friendly-blue/10 dark:bg-friendly-blue/20 flex items-center justify-center mb-4">
                          <span className="text-4xl drop-shadow-glow animate-pulse group-hover:scale-110 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-transform transition-colors">{t.emoji}</span>
                        </div>
                        <h3 className="font-bold text-xl leading-tight mb-2 text-gradient-friendly text-center">{t.title}</h3>
                        <p className="text-muted-foreground font-medium text-center mb-4">{t.desc}</p>
                        <button
                          className={`mt-auto px-4 py-2 rounded-full text-sm font-semibold transition-all bg-gradient-friendly text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 ${selected === t.id ? 'opacity-100' : 'opacity-80'}`}
                          tabIndex={-1}
                        >
                          {selected === t.id ? 'Selected' : 'Choose'}
                        </button>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
          
        {/* Pricing Plan Modal */}
        <PricingPlanModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          onSelect={planKey => {
            setManualPlan(planKey);
            setShowPricing(false);
          }}
        />
          
        {/* Review Modal */}
        <Dialog open={showReview} onOpenChange={setShowReview}>
          <DialogContent className="max-w-lg w-full bg-background rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Review & Start Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deal Title</label>
                <Input {...form.register('title')} className="bg-muted text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea {...form.register('description')} className="bg-muted text-white min-h-[80px]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Amount
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="ml-2 bg-muted text-white rounded px-2 py-1 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                    style={{ width: 'auto' }}
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt.symbol} value={opt.symbol}>{opt.symbol}</option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l bg-muted text-white border-r border-border select-none">{currency}</span>
                  <Input type="number" step="0.01" min="0" {...form.register('amount')} className="bg-muted text-white rounded-l-none" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                </div>
              </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Buyer Email</label>
                  <Input type="email" {...form.register('buyerEmail')} className="bg-muted text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seller Email</label>
                  <Input type="email" {...form.register('sellerEmail')} className="bg-muted text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <Textarea {...form.register('notes')} className="bg-muted text-white min-h-[60px]" />
              </div>
              {/* Pricing Plan Summary */}
              <div className="bg-muted rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 mt-2">
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-2xl">{plan.emoji}</span>
                  <span className="font-bold text-lg">{plan.name}</span>
                  <span className="text-sm text-muted-foreground">({plan.percent}% fee)</span>
                </div>
                <div className="flex-1 text-right">
                  <span className="font-semibold">Estimated Fee:</span> <span className="text-primary font-bold">${fee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <a href="#pricing-info" className="text-xs underline text-muted-foreground ml-2" target="_blank" rel="noopener noreferrer">
                  Learn more about pricing
                </a>
          </div>
              <DialogFooter>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-muted text-white font-semibold hover:bg-muted/80 transition"
                  onClick={() => setShowReview(false)}
                >
                  Cancel
                </button>
                <button
                      type="submit" 
                  className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition"
                    >
                  Submit Deal
                </button>
              </DialogFooter>
                  </form>
          </DialogContent>
        </Dialog>
      </main>
      
      {showSuccessModal && createdDealId && (
        <SuccessModal
          dealId={createdDealId}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(`/deal/${createdDealId}`);
          }}
        />
      )}
    </div>
  );
};

export default CreateDeal;
