'use client';

import { Wallet, TrendingUp, Lock } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import Link from 'next/link';

interface WalletSummaryProps {
  isLoggedIn: boolean;
  balance?: number;
}

export default function WalletSummary({ isLoggedIn, balance = 0 }: WalletSummaryProps) {
  return (
    <section className="px-4 -mt-8 relative z-20">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#121212]/80 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20">
                <Wallet className="w-8 h-8 text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Available Balance</p>
                {isLoggedIn ? (
                  <h2 className="text-4xl font-black text-white leading-none">₹{balance.toFixed(2)}</h2>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="text-xl font-bold text-gray-600 italic">Login to View</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {isLoggedIn ? (
                <>
                  <Link href="/wallet" className="w-full sm:w-auto">
                    <Button variant="premium" className="h-14 px-8 rounded-2xl gap-2 font-bold w-full">
                      <TrendingUp className="w-5 h-5" /> Deposit Cash
                    </Button>
                  </Link>
                  <Link href="/wallet/withdraw" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-white/5 w-full">
                      Withdraw
                    </Button>
                  </Link>
                </>              ) : (
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="premium" className="h-14 px-12 rounded-2xl font-bold w-full">
                    Login to Wallet
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
