'use client';

import {
  Users, Gamepad2, TrendingUp, IndianRupee, Wallet, Swords, Activity,
  Zap, ArrowUpRight, ArrowDownRight, UserPlus, BarChart3, Bell,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, AvatarFallback, cn, Button } from '@/components/ui';
import RevenueLineChart from '@/components/Admin/charts/RevenueLineChart';
import BattleBarChart from '@/components/Admin/charts/BattleBarChart';
import GameResultsPieChart from '@/components/Admin/charts/GameResultsPieChart';
import UserGrowthAreaChart from '@/components/Admin/charts/UserGrowthAreaChart';
import TopReferrersChart from '@/components/Admin/charts/TopReferrersChart';
import SendNotificationModal from '@/components/Admin/SendNotificationModal';
import {
  revenueTrend, battleStats, gameResults, userGrowth, topReferrers,
} from '@/components/Admin/charts/mockData';

const stats = [
  {
    name: 'Total Users',
    value: '4,589',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    trend: '+18%',
    up: true,
  },
  {
    name: 'Active Users',
    value: '1,247',
    icon: UserPlus,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    trend: '+7%',
    up: true,
  },
  {
    name: 'Total Revenue',
    value: '₹3,42,890',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    trend: '+24%',
    up: true,
  },
  {
    name: "Today's Battles",
    value: '68',
    icon: Swords,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    trend: '+12%',
    up: true,
  },
  {
    name: 'Withdrawal Requests',
    value: '23',
    icon: Wallet,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    trend: '-5%',
    up: false,
  },
];

export default function AdminDashboard() {
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  return (
    <div className="space-y-12 pb-20">
      <SendNotificationModal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)} />

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter text-white">Command Overview</h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" /> Platform Intelligence Node
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <Button 
            onClick={() => setShowNotifyModal(true)}
            className="h-10 px-6 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Bell className="w-4 h-4" /> Broadcast
          </Button>
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          <button className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold uppercase tracking-widest shadow-lg shadow-purple-600/20 transition-all active:scale-95">
            Real-time
          </button>
          <button className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-white text-xs font-semibold uppercase tracking-widest transition-all">
            Historical
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
          >
            <Card className="h-full border-white/5 bg-[#121212]/40 backdrop-blur-xl hover:scale-[1.03] transition-all duration-500 group">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={cn(
                      'p-3 md:p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-500',
                      stat.bg,
                      stat.color,
                    )}
                  >
                    <stat.icon className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-semibold tracking-tighter border',
                      stat.up
                        ? 'bg-green-500/10 text-green-500 border-green-500/10'
                        : 'bg-red-500/10 text-red-500 border-red-500/10',
                    )}
                  >
                    {stat.up ? <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                    {stat.trend}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em] md:tracking-[0.3em]">
                    {stat.name}
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-white tracking-tighter">{stat.value}</p>
                </div>

                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] md:text-[9px] text-gray-600 font-semibold uppercase tracking-widest">Live</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Battle Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <RevenueLineChart data={revenueTrend} />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <BattleBarChart data={battleStats} />
        </motion.div>
      </div>

      {/* Pie Chart + User Growth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GameResultsPieChart data={gameResults} />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <UserGrowthAreaChart data={userGrowth} />
        </motion.div>
      </div>

      {/* Top Referrers */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <TopReferrersChart data={topReferrers} />
      </motion.div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="bg-[#121212]/40 backdrop-blur-xl">
          <CardHeader className="px-8 md:px-10 py-8 flex flex-row items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">
                Recent Enlistments
              </CardTitle>
            </div>
            <button className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors">
              View All
            </button>
          </CardHeader>
          <CardContent className="px-8 md:px-10 pb-10">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <Avatar className="w-12 h-12 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-all duration-500 shadow-xl">
                      <AvatarFallback className="text-blue-400 font-semibold">P</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white tracking-tight uppercase text-sm">Player_{i * 123}</p>
                      <p className="text-[10px] text-gray-500 font-mono">+91 987654321{i}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-widest mb-1">Authenticated</p>
                    <Badge variant="outline" className="h-6 px-3 rounded-lg text-[9px] font-semibold border-white/10">
                      {i}m ago
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl">
          <CardHeader className="px-8 md:px-10 py-8 flex flex-row items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                <Swords className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">
                Tactical Operations
              </CardTitle>
            </div>
            <button className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors">
              Combat Log
            </button>
          </CardHeader>
          <CardContent className="px-8 md:px-10 pb-10">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/5 group-hover:scale-110 transition-transform duration-500">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white tracking-tight text-sm">STRAT_BATTLE_{i * 100}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-green-500 font-semibold uppercase">Prize ₹{i * 100}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Node_{i}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning" glow className="h-7 px-4 rounded-xl font-semibold uppercase tracking-widest text-[9px] italic">
                      Active
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
