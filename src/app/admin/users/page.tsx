'use client';

import { useState } from 'react';
import UserTable from '@/components/Admin/UserTable';
import UserAddModal from '@/components/Admin/UserAddModal';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AdminUsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-400 mt-1">Manage players, admins, KYC and wallet balances.</p>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 h-12 px-6"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Players', value: '1,284', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Today', value: '432', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Pending KYC', value: '12', icon: Users, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Banned Users', value: '5', icon: Users, color: 'text-red-500', bg: 'bg-red-500/10' },
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

      <UserTable key={refreshKey} />

      <UserAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
