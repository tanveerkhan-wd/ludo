'use client';

import { Users, Gamepad2, TrendingUp, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { name: 'Total Users', value: '1,234', icon: Users, color: 'from-blue-600 to-cyan-500' },
  { name: 'Active Battles', value: '42', icon: Gamepad2, color: 'from-purple-600 to-pink-500' },
  { name: 'Today\'s Revenue', value: '₹12,500', icon: TrendingUp, color: 'from-green-600 to-emerald-500' },
  { name: 'Total Withdrawals', value: '₹8,200', icon: IndianRupee, color: 'from-orange-600 to-yellow-500' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-gray-400">Real-time platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-gray-400 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">Recent Users</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Player_{i*123}</p>
                    <p className="text-xs text-gray-500">+91 987654321{i}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-400">Joined</p>
                  <p className="font-medium">2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">Recent Battles</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Battle #100{i}</p>
                    <p className="text-xs text-gray-500">Entry: ₹{i*100}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase">Running</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
