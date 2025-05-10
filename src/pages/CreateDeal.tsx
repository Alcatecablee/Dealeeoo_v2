import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import { Sparkles, ArrowLeft, Info, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
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
});

const DEAL_TEMPLATES = [
  {
    id: 'website',
    title: 'Website Development',
    description: 'Standard website development project with milestones',
    amount: 5000,
  },
  {
    id: 'design',
    title: 'Logo & Brand Design',
    description: 'Complete brand identity package with logo and guidelines',
    amount: 2000,
  },
  {
    id: 'content',
    title: 'Content Creation',
    description: 'Blog posts and social media content package',
    amount: 1500,
  },
];

const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      buyerEmail: "",
      sellerEmail: "",
      template: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newDeal = await dealService.createDeal(values as CreateDealInput);
      setCreatedDealId(newDeal.id);
      setShowSuccessModal(true);
      localStorage.setItem('userEmail', values.sellerEmail);
      try {
        await fetch('/api/send-deal-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerEmail: values.buyerEmail,
            sellerEmail: values.sellerEmail,
            dealLink: window.location.origin + '/deal/' + newDeal.id,
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
    const template = DEAL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      form.setValue('title', template.title);
      form.setValue('description', template.description);
      form.setValue('amount', template.amount);
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

  const steps = [
    { id: 1, name: 'Deal Details', description: 'Basic information about your deal' },
    { id: 2, name: 'Parties', description: 'Buyer and seller information' },
    { id: 3, name: 'Review', description: 'Review and confirm your deal' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gradient-friendly">Create New Deal</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Set up your secure transaction by filling in the details below. Both parties will be notified.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol role="list" className="flex items-center justify-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-20 sm:pr-24' : ''}`}>
                    {step.id < currentStep ? (
                      <div className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-friendly-blue">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </span>
                        <span className="ml-3 text-sm font-medium text-friendly-blue">{step.name}</span>
                      </div>
                    ) : step.id === currentStep ? (
                      <div className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-friendly-blue">
                          <span className="h-2.5 w-2.5 rounded-full bg-friendly-blue" />
                        </span>
                        <span className="ml-3 text-sm font-medium text-friendly-blue">{step.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-500">{step.name}</span>
                      </div>
                    )}
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-8 -ml-px h-0.5 w-20 sm:w-24 bg-gray-200" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          
          {!showAiAdvisor && (
            <div className="flex justify-end mb-6">
              <Button 
                onClick={() => setShowAiAdvisor(true)}
                variant="outline" 
                className="border-friendly-purple/30 text-friendly-purple hover:bg-friendly-purple/10"
              >
                <Sparkles className="w-4 h-4 mr-2 text-friendly-purple" />
                Get AI Suggestions
              </Button>
            </div>
          )}
          
          {showAiAdvisor ? (
            <div className="w-full max-w-2xl mx-auto mb-8">
              <button
                className="flex items-center gap-2 text-friendly-blue hover:text-friendly-purple text-sm font-medium mb-4 focus:outline-none transition-colors"
                onClick={() => setShowAiAdvisor(false)}
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Manual Entry
              </button>
              <AIDealAdvisor onSuggestionSelect={handleAISuggestionSelect} />
            </div>
          ) : (
            <Card className="w-full max-w-lg mx-auto border-2 border-friendly-blue/20 shadow-lg hover:shadow-friendly-blue/10 transition-shadow">
              <CardHeader className="bg-gradient-to-r from-friendly-blue/10 to-friendly-teal/10">
                <CardTitle className="text-xl text-gradient-friendly">Create New Deal</CardTitle>
                <CardDescription>
                  Fill out the form to create a new escrow deal between a buyer and seller.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Deal Template
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Choose a template to get started quickly</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            handleTemplateSelect(value);
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="custom">Custom Deal</SelectItem>
                              {DEAL_TEMPLATES.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Start with a template or create a custom deal
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Website Design Project" {...field} className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30" />
                          </FormControl>
                          <FormDescription>
                            A clear title for your deal.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the deal and terms..." 
                              className="resize-none h-24 border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about what this deal covers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Amount ($)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This amount will be held in escrow until the deal is completed</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              {...field} 
                              className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
                            />
                          </FormControl>
                          <FormDescription>
                            The amount to be held in escrow.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="buyerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buyer Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                {...field} 
                                className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sellerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seller Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                {...field} 
                                className="border-friendly-blue/20 focus:border-friendly-blue focus:ring-friendly-blue/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gradient-friendly hover:opacity-90 transition-opacity"
                      >
                        Create Deal
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
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
