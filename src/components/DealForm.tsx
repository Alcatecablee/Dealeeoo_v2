import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { fadeInUp, scaleIn } from '@/lib/animation-utils';
import dealService from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestId } from '@/hooks/use-guest-id';
import AuthModal from './auth/AuthModal';

interface DealFormData {
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
}

const DealForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<DealFormData>();
  // Watch the amount field to automatically update the fee
  const watchAmount = watch('amount');
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ email: string; role: string }[]>([
    { email: '', role: 'buyer' },
    { email: '', role: 'seller' },
  ]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const guestId = useGuestId();

  const handleParticipantChange = (index: number, field: 'email' | 'role', value: string) => {
    setParticipants(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleAddParticipant = () => {
    setParticipants(prev => [...prev, { email: '', role: 'observer' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DealFormData) => {
    try {
      setError(null);
      // Create the deal
      const dealData = {
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        buyerEmail: data.buyerEmail,
        sellerEmail: data.sellerEmail,
        buyer_access_token: crypto.randomUUID(),
        seller_access_token: crypto.randomUUID(),
      };

      // Add creator_user_id if user is authenticated
      if (isAuthenticated && user) {
        dealData['creator_user_id'] = user.id;
      } 
      // Otherwise, add guest_id if available
      else if (guestId) {
        dealData['guest_id'] = guestId;
      }

      const deal = await dealService.createDeal(dealData);
      
      // Add participants
      await Promise.all(participants.map(p => dealService.addParticipant(deal.id, p.email, p.role)));
      
      // After successful deal creation, show the signup modal if not authenticated
      if (!isAuthenticated) {
        setShowAuthModal(true);
      } else {
        navigate(`/deal/${deal.id}`);
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      setError('Failed to create deal. Please try again.');
    }
  };

  const handleAuthSuccess = () => {
    // Navigate to the dashboard after successful authentication
    navigate('/dashboard');
  };

  return (
    <motion.div {...fadeInUp}>
      <Card className="p-6 bg-card max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter deal title"
              aria-describedby="title-error"
              aria-invalid={!!errors.title}
          />
            {errors.title && (
              <motion.p {...scaleIn} id="title-error" className="text-red-500 text-sm" role="alert">
                {errors.title.message}
              </motion.p>
            )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register('description', { required: 'Description is required' })}
            placeholder="Enter deal description"
              aria-describedby="description-error"
              aria-invalid={!!errors.description}
          />
            {errors.description && (
              <motion.p {...scaleIn} id="description-error" className="text-red-500 text-sm" role="alert">
                {errors.description.message}
              </motion.p>
            )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { required: 'Amount is required', min: 1 })}
              placeholder="Enter amount"
              aria-describedby="amount-error"
              aria-invalid={!!errors.amount}
            className="h-10 w-full"
            />
          {errors.amount && (
            <motion.p {...scaleIn} id="amount-error" className="text-red-500 text-sm" role="alert">
              {errors.amount.message}
            </motion.p>
          )}
        </div>

        <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 mt-4">
          <div className="flex items-center gap-x-2 font-semibold">
            <span className="mr-1">
              {Number(watchAmount) > 10000 ? '🏛️' : 
               Number(watchAmount) > 3000 ? '📈' : 
               Number(watchAmount) > 100 ? '💼' : '🛠️'}
            </span> 
            {Number(watchAmount) > 10000 ? 'Enterprise' : 
             Number(watchAmount) > 3000 ? 'Business' : 
             Number(watchAmount) > 100 ? 'Freelancer' : 'Hustler'} 
            <span className="text-xs font-normal">
              {Number(watchAmount) > 10000 ? '(4% fee)' : 
               Number(watchAmount) > 3000 ? '(3% fee)' : 
               Number(watchAmount) > 100 ? '(2% fee)' : '(1% fee)'}
            </span>
          </div>
          <div className="flex items-baseline gap-x-1 font-semibold">
            <span className="text-base text-muted-foreground">$</span>
            <span className="text-base text-primary">
              {Number(watchAmount) > 0 ? 
                (Number(watchAmount) * 
                  (Number(watchAmount) > 10000 ? 0.04 : 
                   Number(watchAmount) > 3000 ? 0.03 : 
                   Number(watchAmount) > 100 ? 0.02 : 0.01)
                ).toFixed(2) : 
                '0.00'}
            </span>
          </div>
        </div>

          <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyerEmail">Buyer Email</Label>
          <Input
            id="buyerEmail"
            type="email"
            {...register('buyerEmail', { required: 'Buyer email is required' })}
            placeholder="Enter buyer's email"
                aria-describedby="buyer-email-error"
                aria-invalid={!!errors.buyerEmail}
          />
              {errors.buyerEmail && (
                <motion.p {...scaleIn} id="buyer-email-error" className="text-red-500 text-sm" role="alert">
                  {errors.buyerEmail.message}
                </motion.p>
              )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerEmail">Seller Email</Label>
          <Input
            id="sellerEmail"
            type="email"
            {...register('sellerEmail', { required: 'Seller email is required' })}
            placeholder="Enter seller's email"
                aria-describedby="seller-email-error"
                aria-invalid={!!errors.sellerEmail}
          />
              {errors.sellerEmail && (
                <motion.p {...scaleIn} id="seller-email-error" className="text-red-500 text-sm" role="alert">
                  {errors.sellerEmail.message}
                </motion.p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Additional Participants</Label>
              <Button
                type="button"
                onClick={handleAddParticipant}
                variant="outline"
                size="sm"
                className="text-blue-500"
              >
                Add Participant
              </Button>
        </div>

            <AnimatePresence>
          {participants.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col md:flex-row gap-2 items-start md:items-center p-3 bg-muted rounded-lg"
                >
                  <Input
                type="email"
                placeholder="Email"
                value={p.email}
                onChange={e => handleParticipantChange(i, 'email', e.target.value)}
                    className="flex-1"
                required
                    aria-label={`Participant ${i + 1} email`}
              />
              <select
                value={p.role}
                onChange={e => handleParticipantChange(i, 'role', e.target.value)}
                    className="w-full md:w-auto px-3 py-2 border rounded-md bg-background"
                    aria-label={`Participant ${i + 1} role`}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="observer">Observer</option>
              </select>
              {participants.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveParticipant(i)}
                      variant="destructive"
                      size="sm"
                      className="w-full md:w-auto"
                      aria-label={`Remove participant ${i + 1}`}
                    >
                      Remove
                    </Button>
              )}
                </motion.div>
          ))}
            </AnimatePresence>
        </div>

          <Button
            type="submit"
            className={cn(
              "w-full bg-gradient-friendly transition-all duration-200",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Deal..." : "Create Deal"}
        </Button>
      </form>
    </Card>
    
    {/* Post-deal creation auth modal */}
    {showAuthModal && (
      <AuthModal 
        defaultMode="signup" 
        onAuthSuccess={handleAuthSuccess} 
        triggerElement={<div style={{ display: 'none' }}></div>}
      />
    )}
    </motion.div>
  );
};

export default DealForm;