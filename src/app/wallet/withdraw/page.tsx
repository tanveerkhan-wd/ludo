'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, History, Settings, Save, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select, Badge, Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function WithdrawPage() {
  const user = useAuthStore(state => state.user);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({ account: '', ifsc: '', name: '' });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
    fetchHistory();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch('/api/user/payment-methods');
      const data = await res.json();
      if (res.ok && data) {
        setPaymentMethod(data.preferredWithdrawalMethod || 'UPI');
        setUpiId(data.upiId || '');
        setBankDetails({
          account: data.bankAccountNumber || '',
          ifsc: data.bankIfscCode || '',
          name: data.bankAccountHolderName || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await fetch('/api/wallet/withdraw/history');
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSavePaymentDetails = async () => {
    setSavingPayment(true);
    try {
      const res = await fetch('/api/user/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredWithdrawalMethod: paymentMethod,
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          bankAccountNumber: paymentMethod === 'BANK' ? bankDetails.account : undefined,
          bankIfscCode: paymentMethod === 'BANK' ? bankDetails.ifsc : undefined,
          bankAccountHolderName: paymentMethod === 'BANK' ? bankDetails.name : undefined,
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Failed to save details');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }
    if (Number(amount) > (user?.walletBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Withdrawal requested successfully');
        setAmount('');
        fetchHistory();
        // Update local user state if needed (or rely on next fetch)
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { variant: 'warning' as const, icon: Clock };
      case 'APPROVED': return { variant: 'info' as const, icon: CheckCircle2, glow: true };
      case 'PROCESSED': return { variant: 'success' as const, icon: CheckCircle2 };
      case 'REJECTED': return { variant: 'destructive' as const, icon: XCircle };
      case 'FAILED': return { variant: 'destructive' as const, icon: AlertCircle };
      default: return { variant: 'secondary' as const, icon: Clock };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <ArrowUpRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-gray-400 mt-1">Transfer your winnings to your bank or UPI instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/20">
            <CardContent className="p-8">
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold text-white tracking-tighter">₹{user?.walletBalance || 0}</h2>
            </CardContent>
          </Card>

          {/* Withdraw Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
                Request Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <Input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Min. 100"
                      className="pl-10 h-14 text-lg font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Minimum withdrawal amount is ₹100. Processing time: up to 24 hours.</p>
                </div>
                
                <Button 
                  type="submit" 
                  variant="premium" 
                  className="w-full h-14 rounded-2xl text-base"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preferred Method</label>
              <Select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI ID (Instant)</option>
                <option value="BANK">Bank Transfer (NEFT/IMPS)</option>
              </Select>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">UPI ID</label>
                <Input 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@ybl"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Number</label>
                  <Input 
                    value={bankDetails.account}
                    onChange={(e) => setBankDetails({...bankDetails, account: e.target.value})}
                    placeholder="Enter Account Number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">IFSC Code</label>
                  <Input 
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                    placeholder="e.g. HDFC0001234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Holder Name</label>
                  <Input 
                    value={bankDetails.name}
                    onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})}
                    placeholder="As per bank records"
                  />
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleSavePaymentDetails}
              disabled={savingPayment}
            >
              {savingPayment ? 'Saving...' : <><Save className="w-4 h-4" /> Save Details</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center opacity-40">
              <Wallet className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold uppercase tracking-widest text-sm">No withdrawals yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                const status = getStatusConfig(item.status);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold">{item.withdrawalId}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                          {new Date(item.requestedAt).toLocaleDateString()} • {item.preferredMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg mb-1">₹{item.amount}</p>
                      <Badge variant={status.variant} glow={status.glow} className="gap-1.5 h-6">
                        <status.icon className="w-3 h-3" />
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
