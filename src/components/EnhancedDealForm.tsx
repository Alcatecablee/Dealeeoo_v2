import React, { useState } from "react";
import { FaDollarSign, FaEnvelope, FaFileUpload, FaCalendarAlt, FaExchangeAlt } from "react-icons/fa";
import dealService from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const currencies = [
  { code: "USD", label: "USD ($)" },
  { code: "ETH", label: "ETH (Ξ)" },
  { code: "BTC", label: "BTC (₿)" },
];

const dealTypes = [
  { value: "swap", label: "Swap" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "service", label: "Service" },
];

interface EnhancedDealFormProps {
  onCancel?: () => void;
  onSuccess?: (data: any) => void;
}

interface EnhancedDealFormData {
  title: string;
  description: string;
  dealType: string;
  amount: string;
  currency: string;
  expiry: string;
  buyer: string;
  seller: string;
  notes: string;
  file: File | null;
  agree: boolean;
}

interface EnhancedDealFormErrors {
  title?: string;
  description?: string;
  amount?: string;
  buyer?: string;
  seller?: string;
  agree?: string;
}

export default function EnhancedDealForm({ onCancel, onSuccess }: EnhancedDealFormProps) {
  const [form, setForm] = useState<EnhancedDealFormData>({
    title: "",
    description: "",
    dealType: "swap",
    amount: "",
    currency: "USD",
    expiry: "",
    buyer: "",
    seller: "",
    notes: "",
    file: null,
    agree: false,
  });
  const [errors, setErrors] = useState<EnhancedDealFormErrors>({});
  const [fee, setFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    setShow(true);
  }, []);

  // Simple validation
  const validate = () => {
    const errs: EnhancedDealFormErrors = {};
    if (!form.title) errs.title = "Title required";
    if (!form.description) errs.description = "Description required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!form.buyer || !/\S+@\S+\.\S+/.test(form.buyer)) errs.buyer = "Valid buyer email required";
    if (!form.seller || !/\S+@\S+\.\S+/.test(form.seller)) errs.seller = "Valid seller email required";
    if (!form.agree) errs.agree = "You must agree to the terms";
    return errs;
  };

  // Fee calculation (1%)
  React.useEffect(() => {
    const amt = parseFloat(form.amount);
    setFee(!isNaN(amt) && amt > 0 ? parseFloat((amt * 0.01).toFixed(2)) : 0);
  }, [form.amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).files ? (e.target as HTMLInputElement).files![0] : null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const buyerToken = uuidv4();
        const sellerToken = uuidv4();
        let attachment_url = null;
        if (form.file) {
          // Upload file to Supabase Storage
          const filePath = `attachments/${Date.now()}_${form.file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('deal-attachments')
            .upload(filePath, form.file);
          if (uploadError) {
            toast.error('Failed to upload attachment');
            setLoading(false);
            return;
          }
          // Get public URL
          const { data: publicUrlData } = supabase.storage.from('deal-attachments').getPublicUrl(filePath);
          attachment_url = publicUrlData?.publicUrl || null;
        }
        const dealInput = {
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
          buyerEmail: form.buyer,
          sellerEmail: form.seller,
          buyer_access_token: buyerToken,
          seller_access_token: sellerToken,
          notes: form.notes,
          expiry: form.expiry ? new Date(form.expiry).toISOString() : undefined,
          deal_type: form.dealType,
          currency: form.currency,
          attachment_url,
        };
        const deal = await dealService.createDeal(dealInput);
        // Send email notification
        try {
          await fetch('/api/send-deal-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerEmail: form.buyer,
              sellerEmail: form.seller,
              dealId: deal.id,
              buyerToken: buyerToken,
              sellerToken: sellerToken,
              notes: form.notes,
              expiry: form.expiry,
              deal_type: form.dealType,
              currency: form.currency,
              attachment_url,
            }),
          });
        } catch (emailErr) {
          toast.error('Deal created, but failed to send email notification.');
        }
        if (onSuccess) onSuccess(deal);
      } catch (error: any) {
        toast.error(error.message || 'Failed to create deal.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form
      className={`max-w-lg mx-auto bg-gray-900 text-white rounded-xl shadow-2xl p-8 space-y-6 border border-primary/30 transition-all duration-700 transform ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} animate-fadein`}
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">Review & Start Deal</h2>
      {/* Deal Details */}
      <div>
        <label className="block font-semibold mb-1 text-blue-300">Deal Title</label>
        <input
          className={`w-full p-2 rounded bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.title ? "border-red-500" : "border-gray-700"}`}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Crypto Deal"
          disabled={loading}
        />
        {errors.title && <p className="text-red-400 text-sm animate-pulse">{errors.title}</p>}
      </div>
      <div>
        <label className="block font-semibold mb-1 text-purple-300">Description</label>
        <textarea
          className={`w-full p-2 rounded bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${errors.description ? "border-red-500" : "border-gray-700"}`}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the deal..."
          disabled={loading}
        />
        {errors.description && <p className="text-red-400 text-sm animate-pulse">{errors.description}</p>}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1 text-pink-300">Deal Type</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            name="dealType"
            value={form.dealType}
            onChange={handleChange}
            disabled={loading}
          >
            {dealTypes.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1 text-green-300">Expiry Date</label>
          <div className="relative">
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:border-green-400"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              disabled={loading}
            />
            <FaCalendarAlt className="absolute right-3 top-3 text-green-300 animate-fadein" />
          </div>
        </div>
      </div>
      {/* Amount */}
      <div>
        <label className="block font-semibold mb-1 text-yellow-300">Amount</label>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 animate-bounce"><FaDollarSign /></span>
          <input
            className={`flex-1 p-2 rounded bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 ${errors.amount ? "border-red-500" : "border-gray-700"}`}
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            type="number"
            min="0"
            step="any"
            disabled={loading}
          />
          <select
            className="p-2 rounded bg-gray-800 border border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            disabled={loading}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        {errors.amount && <p className="text-red-400 text-sm animate-pulse">{errors.amount}</p>}
      </div>
      {/* Participants */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1 text-blue-200">Buyer Email</label>
          <div className="relative">
            <input
              className={`w-full p-2 rounded bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 ${errors.buyer ? "border-red-500" : "border-gray-700"}`}
              name="buyer"
              value={form.buyer}
              onChange={handleChange}
              placeholder="buyer@email.com"
              type="email"
              disabled={loading}
            />
            <FaEnvelope className="absolute right-3 top-3 text-blue-200 animate-fadein" />
          </div>
          {errors.buyer && <p className="text-red-400 text-sm animate-pulse">{errors.buyer}</p>}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1 text-pink-200">Seller Email</label>
          <div className="relative">
            <input
              className={`w-full p-2 rounded bg-gray-800 border transition-all duration-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-200 ${errors.seller ? "border-red-500" : "border-gray-700"}`}
              name="seller"
              value={form.seller}
              onChange={handleChange}
              placeholder="seller@email.com"
              type="email"
              disabled={loading}
            />
            <FaEnvelope className="absolute right-3 top-3 text-pink-200 animate-fadein" />
          </div>
          {errors.seller && <p className="text-red-400 text-sm animate-pulse">{errors.seller}</p>}
        </div>
      </div>
      {/* Notes & Attachments */}
      <div>
        <label className="block font-semibold mb-1 text-purple-200">Notes (optional)</label>
        <textarea
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-200"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any extra info..."
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-green-200">Attachments</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            name="file"
            className="text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gradient-to-r file:from-green-400 file:to-blue-400 file:text-white file:font-semibold file:cursor-pointer transition-all duration-200"
            onChange={handleChange}
            disabled={loading}
          />
          <FaFileUpload className="text-green-300 animate-fadein" />
        </div>
      </div>
      {/* Summary & Actions */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-3 rounded shadow-inner">
        <div className="flex items-center gap-2">
          <FaExchangeAlt className="text-blue-400 animate-pulse text-2xl" />
          <span className="font-bold text-lg text-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Hustler</span>
          <span className="text-xs text-gray-400">(1% fee)</span>
        </div>
        <div>
          <span className="text-gray-300">Estimated Fee: </span>
          <span className="font-semibold text-blue-300">${fee}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="agree"
          checked={form.agree}
          onChange={handleChange}
          disabled={loading}
          className="accent-blue-500 scale-110 transition-all duration-200"
        />
        <span className="text-sm">
          I agree to the <a href="#" className="underline text-blue-300 hover:text-pink-300 transition-colors">Terms & Conditions</a>
        </span>
      </div>
      {errors.agree && <p className="text-red-400 text-sm animate-pulse">{errors.agree}</p>}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-all duration-200 focus:ring-2 focus:ring-gray-400"
          onClick={onCancel ? onCancel : () => window.location.reload()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:from-pink-500 hover:to-blue-500 focus:ring-2 focus:ring-pink-400"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Deal'}
        </button>
      </div>
    </form>
  );
} 