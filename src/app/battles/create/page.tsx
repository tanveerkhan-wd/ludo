'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Swords, 
  ArrowLeft, 
  Info, 
  IndianRupee, 
  Gamepad2, 
  Trophy,
  ShieldCheck,
  Zap,
  Loader2,
  Copy,
  Plus
} from 'lucide-react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function CreateBattlePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [entryFee, setEntryFee] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const calculatePrize = (fee: number) => {
    if (!fee) return 0;
    // Matching backend logic: entryFee * 1.8 (10% platform fee from total pot)
    return Math.floor(fee * 1.8);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee <= 0) {
      return toast.error('Please enter a valid entry fee');
    }

    if (!roomCode || roomCode.length < 4) {
      return toast.error('Please enter a valid Ludo King Room Code');
    }

    if (user && fee > (user.walletBalance || 0)) {
      return toast.error('Insufficient wallet balance');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/battle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryFee: fee,
          roomCode: roomCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Battle created successfully!');
        router.push('/battles');
      } else {
        toast.error(data.error || 'Failed to create battle');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const prizeAmount = calculatePrize(parseFloat(entryFee));

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/battles">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Initialize Battle</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Set your stakes</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Entry Fee Card */}
        <Card className="p-6 border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-[2rem] space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Entry Amount</label>
              <Badge variant="outline" className="border-purple-500/20 text-purple-400 font-mono">
                Min: ₹10
              </Badge>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-focus-within:bg-purple-600 group-focus-within:text-white transition-all">
                <IndianRupee className="w-5 h-5" />
              </div>
              <Input 
                type="number"
                placeholder="0.00"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="pl-16 h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black focus:bg-white/10 transition-all placeholder:text-gray-700"
                required
              />
            </div>

            {/* Quick Select Fees */}
            <div className="flex flex-wrap gap-2">
              {[50, 100, 200, 500, 1000].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setEntryFee(fee.toString())}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    entryFee === fee.toString()
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  ₹{fee}
                </button>
              ))}
            </div>
          </div>

          {/* Reward Calculation */}
          <div className="p-4 bg-purple-600/5 border border-purple-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Winning Prize</p>
                <p className="text-xl font-black text-green-400">₹{prizeAmount || '0'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Platform Fee</p>
              <p className="text-sm font-bold text-gray-300">10%</p>
            </div>
          </div>
        </Card>

        {/* Room Code Card */}
        <Card className="p-6 border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-[2rem] space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Ludo King Room Code</label>
              <Badge variant="outline" className="border-blue-500/20 text-blue-400 font-bold text-[10px]">REQUIRED</Badge>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <Input 
                placeholder="Enter 8-digit Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="pl-16 h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-black tracking-[0.2em] focus:bg-white/10 transition-all placeholder:text-gray-700 placeholder:tracking-normal"
                required
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">How to get code?</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">Open Ludo King App &gt; Play with Friends &gt; Create &gt; Select Classic &gt; Copy the 8-digit Room Code here.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="space-y-4 pt-4">
          <Button 
            type="submit"
            variant="premium" 
            className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-[0.1em] shadow-2xl shadow-purple-600/20 gap-3 group"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" /> 
                Create Battle Now
              </>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Instant Live</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
