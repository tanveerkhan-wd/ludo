'use client';

import { IUser } from '@/types/user';
import { Modal, Badge, Button, Input, Select } from '@/components/ui';
import { User, Wallet, Share2, Activity, PlusCircle, MinusCircle, Loader2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserDetailsModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function UserDetailsModal({ user, isOpen, onClose, onUpdate }: UserDetailsModalProps) {
  const [adjusting, setAdjusting] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [reason, setReason] = useState('');

  if (!user) return null;

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'number' ? value : parseFloat(value || '0');
    return `₹${num.toFixed(2)}`;
  };

  const stats = [
    { label: 'Wallet Balance', value: formatCurrency(user.walletBalance), icon: Wallet, color: 'text-green-500' },
    { label: 'Total Winnings', value: formatCurrency(user.totalWinnings), icon: Trophy, color: 'text-yellow-500' },
    { label: 'Referral Earnings', value: formatCurrency(user.totalReferralEarnings), icon: Share2, color: 'text-purple-500' },
  ];

  const handleAdjustBalance = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!reason || reason.length < 3) {
      toast.error('Please provide a valid reason');
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/wallets/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(amount),
          type,
          reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Wallet ${type === 'ADMIN_CREDIT' ? 'credited' : 'debited'} successfully`);
        setAmount('');
        setReason('');
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Balance adjustment error:', error);
      toast.error('Something went wrong');
    } finally {
      setAdjusting(false);
    }
  };

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
            <div className="flex gap-2 mt-2">
              <Badge>{user.userType}</Badge>
              <Badge variant={user.status === 'Active' ? 'success' : 'destructive'}>{user.status}</Badge>
              <Badge variant="outline">{user.kycStatus} KYC</Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
              <Activity className="w-4 h-4" /> Account Activity
            </h3>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since</span> 
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login</span> 
                <span className="font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Deposited</span> 
                <span className="font-medium text-green-500">{formatCurrency(user.totalDeposited)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Withdrawn</span> 
                <span className="font-medium text-red-500">{formatCurrency(user.totalWithdrawn)}</span>
              </div>
            </div>
          </div>

          {/* Wallet Adjustment */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
              <Wallet className="w-4 h-4" /> Adjust Wallet
            </h3>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Amount</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Action</label>
                  <Select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as 'ADMIN_CREDIT' | 'ADMIN_DEBIT')}
                    className="h-10 text-sm"
                  >
                    <option value="ADMIN_CREDIT">Add (Credit)</option>
                    <option value="ADMIN_DEBIT">Remove (Debit)</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Reason / Note</label>
                <Input 
                  placeholder="e.g. Refund for battle #123" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <Button 
                className="w-full h-10 gap-2 font-bold"
                variant={type === 'ADMIN_CREDIT' ? 'success' : 'destructive'}
                onClick={handleAdjustBalance}
                disabled={adjusting}
              >
                {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  type === 'ADMIN_CREDIT' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />
                )}
                {type === 'ADMIN_CREDIT' ? 'Credit Wallet' : 'Debit Wallet'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
