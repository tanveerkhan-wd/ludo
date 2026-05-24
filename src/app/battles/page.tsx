'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Plus, 
  Search, 
  Clock, 
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Copy,
  CheckCircle2,
  Info,
  Users
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  Input, 
  Badge, 
  Skeleton,
  Modal
} from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BattlesPage() {
  const { user } = useAuthStore();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [activeBattle, setActiveBattle] = useState<any>(null);

  const truncateName = (name: string) => {
    if (name.length > 8) {
      return name.substring(0, 8) + '..';
    }
    return name;
  };

  const fetchBattles = async () => {
    try {
      const res = await fetch(`/api/battle?filter=${filter}&search=${search}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBattles(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattles();
    const interval = setInterval(fetchBattles, 5000);
    return () => clearInterval(interval);
  }, [filter, search]);

  const handlePlay = async (battleId: string) => {
    if (!user) {
      toast.error('Please login to join a battle');
      return;
    }

    try {
      setJoiningId(battleId);
      const res = await fetch(`/api/battle/join/${battleId}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setActiveBattle(data);
      setShowRoomModal(true);
      fetchBattles();
      toast.success('Battle joined successfully!');
    } catch (error: any) {
      toast.error('Failed to join battle');
    } finally {
      setJoiningId(null);
    }
  };

  const copyRoomCode = () => {
    if (activeBattle?.roomCode) {
      navigator.clipboard.writeText(activeBattle.roomCode);
      toast.success('Room code copied!');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Room Code Modal */}
      <Modal 
        isOpen={showRoomModal} 
        onClose={() => setShowRoomModal(false)}
        className="max-w-md"
      >
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Battle Joined!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              Deduction: ₹{activeBattle?.entryFee} • Wallet Synchronized
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 text-center group hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 shadow-2xl relative overflow-hidden" onClick={copyRoomCode}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-20 h-20 -rotate-12" />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-6">Ludo King Room Code</p>
            <div className="flex items-center justify-center gap-6">
              <span className="text-5xl font-black text-white tracking-[0.2em] font-mono group-hover:text-purple-400 transition-colors">
                {activeBattle?.roomCode}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 group-hover:bg-purple-600/10 transition-all">
                <Copy className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 rounded-[1.5rem] p-6 flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Tactical Protocol</p>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                1. Copy the code above.<br />
                2. Open **Ludo King** app.<br />
                3. Select **Play with Friends** &gt; **Join**.<br />
                4. Paste the code and start the match.
              </p>
            </div>
          </div>

          <Button 
            className="w-full h-16 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-purple-600/30 gap-3"
            onClick={() => setShowRoomModal(false)}
          >
            I'm Ready to Combat <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Modal>

      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
            <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic truncate">Battle</h1>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <div className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <p className="text-gray-500 text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">Live Battle</p>
            </div>
          </div>
        </div>
        <Link href="/battles/create" className="shrink-0">
          <Button variant="premium" className="h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl gap-2 font-bold shadow-xl shadow-purple-600/20 uppercase tracking-widest text-[10px] sm:text-xs">
            <Plus className="w-4 h-4 sm:w-5 h-5" /> <span className="hidden xs:inline">CREATE BATTLE</span><span className="xs:hidden">CREATE</span>
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
            <Skeleton key={i} className="h-[200px] w-full rounded-3xl" />
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
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-purple-400">{battle.creator.name[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm leading-none">{truncateName(battle.creator.name)}</p>
                          <p className="text-[7px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Creator</p>
                        </div>
                      </div>

                      <div className="px-4 flex flex-col items-center gap-1">
                        <div className="text-[10px] font-black text-gray-700 italic">VS</div>
                        {battle.status === 'IN_PROGRESS' && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-yellow-500/80 uppercase tracking-tighter">
                            <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
                            LIVE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-end gap-3 text-right">
                        <div className="min-w-0">
                          <p className={`font-bold text-sm leading-none ${battle.opponent ? 'text-white' : 'text-gray-700'}`}>
                            {battle.opponent ? truncateName(battle.opponent.name) : 'Waiting..'}
                          </p>
                          <p className="text-[7px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Opponent</p>
                        </div>
                        <div className={`w-7 h-7 rounded-full border border-dashed flex items-center justify-center shrink-0 ${
                          battle.opponent 
                          ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-white/10' 
                          : 'bg-white/[0.02] border-white/5'
                        }`}>
                          {battle.opponent ? (
                            <span className="text-[10px] font-bold text-red-400">{battle.opponent.name[0]}</span>
                          ) : (
                            <Users className="w-3 h-3 text-gray-800" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">Protocol: {battle.battleId}</p>
                       <Badge variant={battle.status === 'OPEN' ? 'success' : 'secondary'} glow={battle.status === 'OPEN'} className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                          {battle.status}
                       </Badge>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-white/5">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Entry</p>
                        <p className="text-xl font-black text-white italic">₹{battle.entryFee}</p>
                      </div>
                      
                      <div className="px-4 flex flex-col items-center gap-2">
                        {battle.status === 'IN_PROGRESS' && (user?.id === battle.creatorId || user?.id === battle.opponentId) ? (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(battle.roomCode);
                              toast.success('Room code copied!');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/code"
                          >
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest border-r border-white/10 pr-2">Code</span>
                            <span className="text-[10px] font-mono font-bold text-purple-400 tracking-wider">{battle.roomCode}</span>
                            <Copy className="w-3 h-3 text-gray-500 group-hover/code:text-purple-500" />
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handlePlay(battle.id)}
                            variant={battle.status === 'OPEN' ? 'premium' : 'outline'} 
                            className="h-10 px-6 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px]"
                            disabled={battle.status !== 'OPEN' || (user && battle.creatorId === user.id) || joiningId === battle.id}
                          >
                            {joiningId === battle.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              battle.status === 'OPEN' ? (user && battle.creatorId === user.id ? 'WAITING' : 'PLAY') : battle.status
                            )}
                          </Button>
                        )}
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
