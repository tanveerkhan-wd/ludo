'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Share2, 
  Copy, 
  CheckCircle, 
  TrendingUp, 
  History,
  Gift,
  ArrowRight
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode: string;
  totalEarnings: number;
  totalReferred: number;
  referralLink: string;
}

interface ReferralHistory {
  id: string;
  amount: number;
  createdAt: string;
  referee: { name: string };
  battle: { battleId: string };
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch('/api/referral/stats'),
          fetch('/api/referral/history')
        ]);
        
        const statsData = await statsRes.json();
        const historyData = await historyRes.json();
        
        setStats(statsData);
        setHistory(historyData);
      } catch (error) {
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refer & Earn</h1>
          <p className="text-gray-400 mt-1">Earn 3% lifetime commission on every game your friends play.</p>
        </div>
        <Badge variant="premium" className="px-4 py-1.5 rounded-xl h-fit w-fit">
          <Gift className="w-4 h-4 mr-2" />
          Lifetime Rewards
        </Badge>
      </div>

      {/* Main Referral Card */}
      <Card className="bg-gradient-to-br from-purple-900/40 via-[#121212] to-red-900/40 border-purple-500/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex-1 flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-widest uppercase">{stats?.referralCode || '------'}</span>
                    <button 
                      onClick={() => stats && copyToClipboard(stats.referralCode)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Share Referral Link</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex-1 truncate text-gray-300 text-sm">
                    {stats?.referralLink || 'Loading link...'}
                  </div>
                  <Button 
                    variant="premium" 
                    className="h-full py-4 rounded-2xl"
                    onClick={() => stats && copyToClipboard(stats.referralLink)}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center">
                <p className="text-gray-400 text-sm font-semibold uppercase mb-2">Total Earned</p>
                <p className="text-4xl font-bold text-green-500">₹{stats?.totalEarnings || 0}</p>
                <TrendingUp className="w-6 h-6 text-green-500/50 mt-4" />
              </div>
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center">
                <p className="text-gray-400 text-sm font-semibold uppercase mb-2">Total Referred</p>
                <p className="text-4xl font-bold text-blue-400">{stats?.totalReferred || 0}</p>
                <Users className="w-6 h-6 text-blue-400/50 mt-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* How it works */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="font-bold">Invite Friends</p>
                <p className="text-sm text-gray-400">Share your code or link with friends.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="font-bold">They Play Games</p>
                <p className="text-sm text-gray-400">When they join any battle on Bajiger Ludo.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="font-bold">You Earn Cash</p>
                <p className="text-sm text-gray-400">Get 3% of their entry fee instantly in your wallet.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earning History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Recent Earnings
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-purple-400">View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center space-y-3 opacity-30">
                <History className="w-12 h-12 mx-auto" />
                <p className="font-semibold uppercase tracking-widest text-sm">No Earnings Yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.referee.name} played a game</p>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-widest">Battle #{item.battle.battleId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">+₹{item.amount}</p>
                      <p className="text-[10px] text-gray-600 font-semibold">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
