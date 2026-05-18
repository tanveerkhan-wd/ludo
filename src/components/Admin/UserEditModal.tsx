'use client';

import { useState, useEffect } from 'react';
import { IUser } from '@/types/user';
import { Modal, Button, Input, Select, Badge } from '@/components/ui';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserEditModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    userType: '',
    status: '',
    kycStatus: '',
    walletBalance: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        userType: user.userType || 'Player',
        status: user.status || 'Active',
        kycStatus: user.kycStatus || 'Pending',
        walletBalance: user.walletBalance || 0,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('User updated successfully');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit User Details"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Full Name</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">User Type</label>
            <Select 
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            >
              <option value="Player">Player</option>
              <option value="Admin">Admin</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Account Status</label>
            <Select 
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Banned">Banned</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">KYC Status</label>
            <Select 
              value={formData.kycStatus}
              onChange={(e) => setFormData({ ...formData, kycStatus: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Wallet Balance (₹)</label>
            <Input 
              type="number"
              value={formData.walletBalance}
              onChange={(e) => setFormData({ ...formData, walletBalance: Number(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Phone (Non-editable)</label>
            <div className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 flex items-center text-gray-500">
              {user?.phone}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 border-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
