'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Plus, 
  Filter, 
  Search, 
  Trophy, 
  Users, 
  Clock, 
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Lock
} from 'lucide-react';
import { Button, Card, CardContent, Input, Badge, Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function BattlesPage() {
  const { user } = useAuthStore();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBattles();
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(fetchBattles, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchBattles = async () => {
    try {
      // In a real app, we would fetch from /api/battle
      // For now, using mock data based on LiveBattles.tsx
      const mockBattles = [
        { id: '1', battleId: 'B-101', creator: { name: 'Rahul' }, entryFee: '100', prizeAmount: '180', status: 'OPEN' },
        { id: '2', battleId: 'B-102', creator: { name: 'Amit' }, entryFee: '500', prizeAmount: '900', status: 'OPEN' },
        { id: '3', battleId: 'B-103', creator: { name: 'Sanjay' }, entryFee: '1000', prizeAmount: '1800', status: 'OPEN' },
        { id: '4', battleId: 'B-104', creator: { name: 'Vikram' }, entryFee: '50', prizeAmount: '90', status: 'FULL' },
        { id: '5', battleId: 'B-105', creator: { name: 'Deepak' }, entryFee: '250', prizeAmount: '450', status: 'OPEN' },
      ];
      
      let filtered = mockBattles;
      if (filter === 'OPEN') filtered = mockBattles.filter(b => b.status === 'OPEN');
      if (search) filtered = filtered.filter(b => b.creator.name.toLowerCase().includes(search.toLowerCase()) || b.battleId.includes(search));
      
      setBattles(filtered);
    } catch (err) {
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Battle</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Live Battle</p>
            </div>
          </div>
        </div>
        <Link href="/battles/create">
          <Button variant="premium" className="h-14 px-8 rounded-2xl gap-2 font-bold shadow-xl shadow-purple-600/20 uppercase tracking-widest text-xs">
            <Plus className="w-5 h-5" /> CREATE BATTLE
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          <Input 
            placeholder="Search Player or Battle ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'MY BATTLES'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Battles Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-3xl" />
          ))
        ) : battles.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-40">
            <Swords className="w-16 h-16 mx-auto mb-4" />
            <p className="font-bold uppercase tracking-[0.3em] text-sm">No Active Battles Found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {battles.map((battle, index) => (
              <motion.div
                key={battle.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="relative overflow-hidden group border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-3xl hover:border-purple-500/30 transition-all duration-500">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-400">{battle.creator.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white leading-none">{battle.creator.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Host</p>
                        </div>
                      </div>
                      <Badge variant={battle.status === 'OPEN' ? 'success' : 'secondary'} glow={battle.status === 'OPEN'} className="px-2 py-0.5 font-bold">
                        {battle.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-white/5">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Entry</p>
                        <p className="text-xl font-black text-white italic">₹{battle.entryFee}</p>
                      </div>
                      
                      <div className="px-4">
                        <Button 
                          variant={battle.status === 'OPEN' ? 'premium' : 'outline'} 
                          className="h-10 px-6 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px]"
                          disabled={battle.status !== 'OPEN'}
                        >
                          {battle.status === 'OPEN' ? 'PLAY' : 'FULL'}
                        </Button>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Winning</p>
                        <p className="text-xl font-black text-green-400 italic">₹{battle.prizeAmount}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm font-bold text-white">Fair Play Guaranteed</p>
            <p className="text-xs text-gray-500">Anti-cheat systems active for all battles.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-sm font-bold text-white">Instant Settlement</p>
            <p className="text-xs text-gray-500">Winning amount credited immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
