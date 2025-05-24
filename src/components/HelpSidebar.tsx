import React from 'react';
import { CheckCircle2, Link as LinkIcon, Send, FileText, UserCheck, Users, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const HelpSidebar: React.FC = () => {
  return (
    <div className="space-y-6 w-full h-full flex flex-col justify-start">
      {/* How It Works Section */}
      <Card className="p-5 bg-gray-800/50 border-border/50">
        <h3 className="font-bold text-xl mb-4 text-transparent bg-clip-text bg-gradient-friendly">How It Works</h3>
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-full bg-blue-500/20 p-1.5 mt-0.5">
              <span className="text-sm font-bold text-blue-400">1</span>
            </div>
            <div>
              <p className="text-sm text-white/90">Fill in the deal details, including both buyer's and seller's email addresses.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-full bg-purple-500/20 p-1.5 mt-0.5">
              <span className="text-sm font-bold text-purple-400">2</span>
            </div>
            <div>
              <p className="text-sm text-white/90">Both parties will receive unique links to view and manage the deal.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-full bg-green-500/20 p-1.5 mt-0.5">
              <span className="text-sm font-bold text-green-400">3</span>
            </div>
            <div>
              <p className="text-sm text-white/90">The buyer confirms payment, and the seller confirms delivery to complete the deal.</p>
            </div>
          </li>
        </ol>
      </Card>

      {/* Security Tips Section */}
      <Card className="p-5 bg-gray-800/50 border-border/50">
        <h3 className="font-bold text-xl mb-4 gradient-text">Security Tips</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">Keep your deal link private. Only share with the other party in your transaction.</p>
          </li>
          <li className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">Be specific in your deal description to avoid misunderstandings.</p>
          </li>
          <li className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">For high-value transactions, consider creating an account for extra protection.</p>
          </li>
        </ul>
      </Card>

      {/* Trust Section */}
      <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <span className="font-semibold gradient-text">Why trust us?</span>
        </div>
        <p className="text-xs text-white/80">Our platform ensures transparency and security for both parties with real-time updates and secure transaction tracking.</p>
      </div>
    </div>
  );
};

export default HelpSidebar;