'use client';

import { Share2, Gift, ArrowRight, Copy, Check } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ReferralPromoProps {
  isLoggedIn: boolean;
  referralCode?: string;
}

export default function ReferralPromo({ isLoggedIn, referralCode }: ReferralPromoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-900/40 via-[#121212] to-transparent border-purple-500/20 p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] -z-10 group-hover:bg-purple-600/20 transition-all duration-700" />
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-widest">
                <Gift className="w-4 h-4" /> Lifetime Commission
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                REFER & EARN <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  3% COMMISSION
                </span>
              </h2>
              <p className="text-gray-400 font-medium max-w-md">
                Invite your friends and earn 3% of their entry fee for every battle they play, for a lifetime!
              </p>

              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl w-full sm:w-auto">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Your Code:</span>
                    <span className="text-white font-mono font-bold tracking-widest">{referralCode}</span>
                  </div>
                  <Button variant="premium" className="h-14 px-8 rounded-2xl gap-2 w-full sm:w-auto" onClick={handleCopy}>
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
              ) : (
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="premium" className="h-14 px-10 rounded-2xl gap-2 w-full sm:w-auto group">
                      Login to Refer <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-600/20 rounded-full animate-ping opacity-20" />
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-600/40 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Share2 className="w-16 h-16 md:w-24 md:h-24 text-white" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
