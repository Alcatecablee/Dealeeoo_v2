import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface DealFormData {
  title: string;
  description: string;
  amount: number;
  buyerEmail: string;
  sellerEmail: string;
}

const DealForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<DealFormData>();

  const onSubmit = async (data: DealFormData) => {
    try {
      // TODO: Implement deal creation logic
      console.log('Deal data:', data);
      navigate('/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  return (
    <Card className="p-6 bg-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter deal title"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register('description', { required: 'Description is required' })}
            placeholder="Enter deal description"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            {...register('amount', { required: 'Amount is required', min: 1 })}
            placeholder="Enter amount"
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerEmail">Buyer Email</Label>
          <Input
            id="buyerEmail"
            type="email"
            {...register('buyerEmail', { required: 'Buyer email is required' })}
            placeholder="Enter buyer's email"
          />
          {errors.buyerEmail && <p className="text-red-500 text-sm">{errors.buyerEmail.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerEmail">Seller Email</Label>
          <Input
            id="sellerEmail"
            type="email"
            {...register('sellerEmail', { required: 'Seller email is required' })}
            placeholder="Enter seller's email"
          />
          {errors.sellerEmail && <p className="text-red-500 text-sm">{errors.sellerEmail.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-gradient-friendly">
          Create Deal
        </Button>
      </form>
    </Card>
  );
};

export default DealForm; 