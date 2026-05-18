'use client';

import { useState } from 'react';
import BattleTable from '@/components/Admin/BattleTable';
import BattleAddModal from '@/components/Admin/BattleAddModal';
import { Swords, Trophy, AlertTriangle, PlayCircle } from 'lucide-react';
import { Button, Card, CardContent, cn } from '@/components/ui';

export default function AdminBattlesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <Button 
          variant="premium"
          className="gap-3 h-14 px-8 rounded-2xl font-bold uppercase tracking-widest"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Swords className="w-5 h-5" />
          Initialize Battle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Battles', value: '24', icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Played', value: '1,582', icon: Trophy, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Open Protocol', value: '8', icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Integrity Alerts', value: '3', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={cn("p-4 rounded-2xl shadow-lg", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
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
