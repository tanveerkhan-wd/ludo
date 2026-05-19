'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Wallet, Trophy, Share2, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* User Info & Wallet */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-xl"
      >
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white">{user?.name || 'Player'}</h2>
            <p className="text-xs text-purple-400 font-mono mt-1">ID: {user?._id?.toString().slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/5 rounded-2xl p-3 inline-block">
              <Wallet className="w-6 h-6 text-yellow-500 mb-1" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Balance</p>
              <p className="text-xl font-bold text-white">₹{user?.walletBalance || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/dashboard/wallet/deposit" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-green-600/20">
            <Plus className="w-5 h-5" /> Add Cash
          </Link>
          <Link href="/dashboard/wallet/withdraw" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all border border-white/10">
            Withdraw <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121212] border border-white/5 rounded-2xl p-4"
        >
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-gray-400 text-xs font-semibold uppercase">Total Wins</p>
          <p className="text-xl font-bold">₹{user?.totalWinnings || 0}</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121212] border border-white/5 rounded-2xl p-4"
        >
          <Share2 className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-gray-400 text-xs font-semibold uppercase">Referral</p>
          <p className="text-xl font-bold">₹{user?.totalReferralEarnings || 0}</p>
        </motion.div>
      </div>

      {/* Play Now Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link href="/dashboard/battles" className="block relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
          <div className="relative bg-[#121212] border border-white/10 rounded-3xl p-6 overflow-hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold italic tracking-tighter">BATTLE NOW</h3>
                <p className="text-gray-400 text-sm">Join a table and win real cash!</p>
              </div>
              <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4 rounded-2xl">
                <Gamepad2 className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Referral Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-lg text-black font-bold">3%</div>
          <div>
            <p className="text-sm font-bold text-yellow-500 uppercase">Refer & Earn</p>
            <p className="text-xs text-gray-400">Lifetime referral commission</p>
          </div>
        </div>
        <Link href="/dashboard/referral" className="text-white bg-white/5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10">
          VIEW
        </Link>
      </motion.div>
    </div>
  );
}

// Icon component needed as Gamepad2 was not imported from lucide-react in the top section
function Gamepad2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}
