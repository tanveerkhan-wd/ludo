'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Trophy, 
  Users,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function WalletPage() {
  const user = useAuthStore(state => state.user);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [filter]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [balanceRes, transRes] = await Promise.all([
        fetch('/api/wallet/balance'),
        fetch(`/api/wallet/transactions${filter !== 'ALL' ? `?type=${filter}` : ''}`)
      ]);

      if (balanceRes.ok) setBalanceData(await balanceRes.json());
      if (transRes.ok) {
        const data = await transRes.json();
        setTransactions(data.transactions);
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!amount || amount < 10) {
      toast.error('Minimum deposit is ₹10');
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok && data.payment_url) {
        toast.success('Redirecting to payment gateway...');
        // Redirect to ZapUPI payment page
        window.location.href = data.payment_url;
      } else {
        toast.error(data.error || 'Failed to initiate deposit');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle callback status from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txn = params.get('txn');

    const verifyPayment = async (txnId: string) => {
      const toastId = toast.loading('Verifying payment with gateway...');
      try {
        const res = await fetch('/api/wallet/deposit/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txnId })
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'SUCCESS') {
          toast.success(`₹${data.amount} credited to your wallet!`, { id: toastId });
          fetchWalletData();
        } else if (data.status === 'PENDING') {
          toast.info('Payment is still pending. It will reflect once confirmed.', { id: toastId });
        } else if (data.status === 'FAILED') {
          toast.error('Payment failed.', { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } catch (err) {
        toast.error('Failed to verify payment. Please refresh.', { id: toastId });
      }
    };

    if (txn) {
      verifyPayment(txn);
      // Clear URL parameters but keep the txn for verification logic if needed
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status) {
      if (status === 'success') {
        toast.success('Payment initiated successfully!');
      } else if (status === 'failed') {
        toast.error('Payment failed or was cancelled.');
      }
      window.history.replaceState({}, '', window.location.pathname);
      fetchWalletData();
    }
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'BATTLE_WIN':
      case 'REFUND':
      case 'REFERRAL_COMMISSION':
      case 'ADMIN_CREDIT':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    return type.replace('_', ' ');
  };

  const filters = [
    { label: 'All', value: 'ALL' },
    { label: 'Deposits', value: 'DEPOSIT' },
    { label: 'Withdrawals', value: 'WITHDRAWAL' },
    { label: 'Winnings', value: 'BATTLE_WIN' },
    { label: 'Referrals', value: 'REFERRAL_COMMISSION' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/wallet/withdraw">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10">Withdraw</Button>
          </Link>
          <Button variant="premium" className="h-12 px-8 rounded-xl" onClick={() => document.getElementById('deposit-input')?.focus()}>            Deposit Cash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Balance Card */}
        <Card className="bg-gradient-to-br from-purple-900/40 via-purple-600/10 to-transparent border-purple-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32 rotate-12" />
          </div>
          <CardContent className="p-8">
            <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-300">₹</span>
              <h2 className="text-6xl font-bold text-white tracking-tighter">
                {balanceData ? parseFloat(balanceData.walletBalance).toFixed(2) : '0.00'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Winnings</p>
                <p className="text-lg font-bold text-green-400">₹{balanceData ? parseFloat(balanceData.totalWinnings).toFixed(2) : '0.00'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Referral Amount</p>
                <p className="text-lg font-bold text-blue-400">₹{balanceData ? parseFloat(balanceData.totalReferralEarnings).toFixed(2) : '0.00'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Deposited</p>
                <p className="text-lg font-bold text-white">₹{balanceData ? parseFloat(balanceData.totalDeposited).toFixed(2) : '0.00'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Withdrawn</p>
                <p className="text-lg font-bold text-red-400">₹{balanceData ? parseFloat(balanceData.totalWithdrawn).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Deposit Card */}
        <Card className="bg-[#121212] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Quick Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <Input 
                  id="deposit-input"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10 h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setDepositAmount(amt.toString())}
                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold gap-2"
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount}
            >
              {isDepositing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deposit Now'}
            </Button>
            <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">Secure Payment Gateway</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold">Transaction History</h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === f.value 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Card className="bg-[#121212] border-white/5 overflow-hidden">
          <CardContent className="p-0">
            {loading && transactions.length === 0 ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <History className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold uppercase tracking-widest text-sm">No transactions found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {transactions.map((t) => (
                  <div key={t.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        {getTransactionIcon(t.type)}
                      </div>
                      <div>
                        <p className="font-bold">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-white/5 text-gray-400 border-none">
                            {getTransactionLabel(t.type)}
                          </Badge>
                          {t.status !== 'SUCCESS' && (
                            <Badge 
                              variant={t.status === 'PENDING' ? 'outline' : 'destructive'} 
                              className={`text-[10px] h-5 px-2 bg-transparent border-white/10 ${
                                t.status === 'PENDING' ? 'text-yellow-500 border-yellow-500/20' : 'text-red-500 border-red-500/20'
                              }`}
                            >
                              {t.status}
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                            {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        ['DEPOSIT', 'BATTLE_WIN', 'REFUND', 'REFERRAL_COMMISSION', 'ADMIN_CREDIT'].includes(t.type)
                        ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {['DEPOSIT', 'BATTLE_WIN', 'REFUND', 'REFERRAL_COMMISSION', 'ADMIN_CREDIT'].includes(t.type) ? '+' : '-'}
                        ₹{parseFloat(t.amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ID: {t.transactionId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
