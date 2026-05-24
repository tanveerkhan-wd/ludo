'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Smartphone, CreditCard, Landmark, Loader2, Save } from 'lucide-react';
import { Button, Input, Select, Card, CardContent } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function UpdateProfilePage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolderName: '',
    preferredWithdrawalMethod: 'UPI' as 'UPI' | 'BANK',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/payment-methods');
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        setFormData({
          name: user?.name || '',
          upiId: data.upiId || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankIfscCode: data.bankIfscCode || '',
          bankAccountHolderName: data.bankAccountHolderName || '',
          preferredWithdrawalMethod: data.preferredWithdrawalMethod || 'UPI',
        });
      } catch (err) {
        toast.error('Failed to load user information');
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Information updated successfully');
        if (data.user) {
          setAuth(data.user);
        }
        router.push('/profile');
      } else {
        toast.error(data.error || 'Failed to update information');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Update Information</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Personal Details</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Display Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Phone Number (Verified)</label>
              <div className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 flex items-center text-gray-500 gap-3">
                <Smartphone className="w-4 h-4" />
                {user?.phone}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Settings */}
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Withdrawal Methods</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Preferred Method</label>
              <Select 
                value={formData.preferredWithdrawalMethod}
                onChange={(e) => setFormData({ ...formData, preferredWithdrawalMethod: e.target.value as 'UPI' | 'BANK' })}
              >
                <option value="UPI">UPI Transfer</option>
                <option value="BANK">Bank Transfer (IMPS)</option>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">UPI Details</p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">UPI ID</label>
                <Input 
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="example@upi"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-400">Account Holder Name</label>
                  <Input 
                    value={formData.bankAccountHolderName}
                    onChange={(e) => setFormData({ ...formData, bankAccountHolderName: e.target.value })}
                    placeholder="As per bank records"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Account Number</label>
                  <Input 
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">IFSC Code</label>
                  <Input 
                    value={formData.bankIfscCode}
                    onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold text-lg gap-2 shadow-xl shadow-purple-600/20"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
