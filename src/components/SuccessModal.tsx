import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessModalProps {
  dealId: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ dealId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const dealUrl = `${window.location.origin}/deal/${dealId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dealUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full relative border border-border animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gradient-friendly">Deal Created Successfully!</h2>
          <p className="text-muted-foreground">Share this link with the buyer to get started.</p>
        </div>

        <div className="bg-background/50 p-4 rounded-lg mb-6 flex items-center justify-between gap-2">
          <code className="text-sm text-muted-foreground truncate flex-1">{dealUrl}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0 hover:bg-primary/10"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-gradient-friendly"
            onClick={() => window.open(dealUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Deal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 