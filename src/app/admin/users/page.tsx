'use client';

import { useState } from 'react';
import UserTable from '@/components/Admin/UserTable';
import UserAddModal from '@/components/Admin/UserAddModal';
import { Users, UserPlus, ShieldCheck, Activity, ShieldAlert, IndianRupee } from 'lucide-react';
import { Button, Card, CardContent, cn } from '@/components/ui';

export default function AdminUsersPage() {
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
          <UserPlus className="w-5 h-5" />
          Enlist New Player
        </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Verified Players', value: '842', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Active Sessions', value: '156', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'KYC Backlog', value: '12', icon: ShieldAlert, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Total Capital', value: '₹4.2L', icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={cn("p-4 rounded-2xl shadow-lg", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>


      <UserTable key={refreshKey} />

      <UserAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
