'use client';

import { IUser } from '@/types/user';
import { Modal, Badge } from '@/components/ui';
import { User, Wallet, Share2, Gamepad2, Activity, Shield } from 'lucide-react';

interface UserDetailsModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const stats = [
    { label: 'Total Earnings', value: `₹${user.totalEarnings.toLocaleString()}`, icon: Wallet, color: 'text-green-500' },
    { label: 'Referral Earnings', value: `₹${user.totalReferralEarnings.toLocaleString()}`, icon: Share2, color: 'text-purple-500' },
    { label: 'KYC Status', value: user.kycStatus, icon: Shield, color: 'text-blue-500' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="User Details"
      className="max-w-3xl"
    >
      <div className="space-y-8">
        {/* Header Profile */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-red-500/20 flex items-center justify-center border border-white/10">
            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" /> : <User className="w-10 h-10 text-purple-400" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400 font-mono">+91 {user.phone}</p>
            <Badge className="mt-2">{user.userType}</Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs uppercase font-bold">{stat.label}</span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Wallet className="w-4 h-4" /> Wallet Summary</h3>
            <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between"><span>Current Balance</span> <span className="font-bold text-green-500">₹{user.walletBalance.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Status</span> <span className="text-gray-400">{user.status}</span></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4" /> Account Activity</h3>
            <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between"><span>Joined</span> <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Last Login</span> <span className="text-gray-400">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
