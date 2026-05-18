'use client';

import { useState } from 'react';
import BattleTable from '@/components/Admin/BattleTable';
import BattleAddModal from '@/components/Admin/BattleAddModal';
import { Swords, Trophy, AlertTriangle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AdminBattlesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Battle Management</h1>
          <p className="text-gray-400 mt-1">Monitor active games, resolve disputes and manage entry fees.</p>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 h-12 px-6"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Swords className="w-5 h-5" />
          Create Manual Battle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Battles', value: '24', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Played', value: '1,582', icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Open Challenges', value: '8', icon: Swords, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Disputed Games', value: '3', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#121212] border border-white/5 p-6 rounded-3xl flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <BattleTable key={refreshKey} />

      <BattleAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
