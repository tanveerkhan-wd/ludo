'use client';

import { Swords, Users, Trophy, Lock, ArrowRight } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Battle {
  id: string;
  battleId: string;
  creator: { name: string; avatar?: string };
  entryFee: string;
  prizeAmount: string;
}

interface LiveBattlesProps {
  isLoggedIn: boolean;
  battles: Battle[];
}

export default function LiveBattles({ isLoggedIn, battles }: LiveBattlesProps) {
  // Use real battles or dummy ones if list is empty
  const displayBattles = battles.length > 0 ? battles : [
    { id: '1', battleId: 'B-101', creator: { name: 'Rahul' }, entryFee: '100', prizeAmount: '180' },
    { id: '2', battleId: 'B-102', creator: { name: 'Amit' }, entryFee: '500', prizeAmount: '900' },
    { id: '3', battleId: 'B-103', creator: { name: 'Sanjay' }, entryFee: '1000', prizeAmount: '1800' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
              <Swords className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Open Battles</h2>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">Join & Win Instantly</p>
            </div>
          </div>
          <Link href="/battles">
            <Button variant="ghost" className="text-purple-400 gap-2 font-bold uppercase tracking-widest text-xs">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBattles.map((battle, index) => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group border-white/5 bg-[#121212]/40 backdrop-blur-xl">
                {!isLoggedIn && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4 border border-purple-500/20">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-white font-bold text-sm mb-4">Login to view details and join this battle</p>
                    <Link href="/login" className="w-full">
                      <Button variant="premium" size="sm" className="w-full h-10 rounded-xl">Login Now</Button>
                    </Link>
                  </div>
                )}

                <div className={`p-6 space-y-6 ${!isLoggedIn ? 'blur-sm' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">{battle.creator.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none">{battle.creator.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Creator</p>
                      </div>
                    </div>
                    <Badge variant="success" glow className="px-2 py-0.5 font-bold">OPEN</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Entry Fee</p>
                      <p className="text-xl font-bold text-white">₹{battle.entryFee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Prize Pool</p>
                      <p className="text-xl font-bold text-green-400">₹{battle.prizeAmount}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full h-12 rounded-xl group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all font-bold">
                    Join Battle
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
