'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  TrendingUp, 
  Activity,
  History,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { toast } from 'sonner';

export default function AdminWalletOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/wallets/stats');
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      toast.error('Failed to load wallet stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total User Balance',
      value: stats ? `₹${parseFloat(stats.totalUserBalance).toFixed(2)}` : '₹0.00',
      description: 'Liability to platform',
      icon: Wallet,
      color: 'text-purple-500'
    },
    {
      title: 'Total Deposits',
      value: stats ? `₹${parseFloat(stats.totalDeposits).toFixed(2)}` : '₹0.00',
      description: 'Lifetime revenue in',
      icon: ArrowDownCircle,
      color: 'text-green-500'
    },
    {
      title: 'Total Withdrawals',
      value: stats ? `₹${parseFloat(stats.totalWithdrawals).toFixed(2)}` : '₹0.00',
      description: 'Lifetime revenue out',
      icon: ArrowUpCircle,
      color: 'text-red-500'
    },
    {
      title: "Today's Deposits",
      value: stats ? `₹${parseFloat(stats.todayDeposits).toFixed(2)}` : '₹0.00',
      description: 'Last 24 hours',
      icon: TrendingUp,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet Overview</h1>
        <p className="text-muted-foreground">High-level financial overview of the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Platform Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Net Platform Retention</p>
                <p className="text-xs text-muted-foreground">Total Deposits - Total Withdrawals</p>
              </div>
              <div className="text-xl font-bold text-green-500">
                ₹{stats ? (parseFloat(stats.totalDeposits) - parseFloat(stats.totalWithdrawals)).toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Actual Liquidity</p>
                <p className="text-xs text-muted-foreground">Net Retention - User Balances</p>
              </div>
              <div className="text-xl font-bold text-blue-500">
                ₹{stats ? (parseFloat(stats.totalDeposits) - parseFloat(stats.totalWithdrawals) - parseFloat(stats.totalUserBalance)).toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-xs text-yellow-500 leading-relaxed">
                Liquidity represents the platform's actual profit after accounting for all user balances. 
                Always ensure net platform retention is significantly higher than total user balances.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-4 hover:bg-muted/50 rounded-lg border border-transparent hover:border-border transition-all group">
              <p className="text-sm font-bold group-hover:text-purple-500 transition-colors">Reconcile Ledger</p>
              <p className="text-xs text-muted-foreground">Verify all transactions match user balance updates.</p>
            </button>
            <button className="w-full text-left p-4 hover:bg-muted/50 rounded-lg border border-transparent hover:border-border transition-all group">
              <p className="text-sm font-bold group-hover:text-purple-500 transition-colors">Generate Monthly Report</p>
              <p className="text-xs text-muted-foreground">Export a detailed P&L statement for the current month.</p>
            </button>
            <button className="w-full text-left p-4 hover:bg-muted/50 rounded-lg border border-transparent hover:border-border transition-all group">
              <p className="text-sm font-bold group-hover:text-purple-500 transition-colors">Audit Admin Actions</p>
              <p className="text-xs text-muted-foreground">View all manual credits/debits performed by staff.</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
