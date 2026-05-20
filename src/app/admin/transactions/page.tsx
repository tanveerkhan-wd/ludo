'use client';

import { useState } from 'react';
import TransactionTable from '@/components/Admin/TransactionTable';
import { ReceiptText, TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, cn } from '@/components/ui';

export default function AdminTransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ReceiptText className="w-8 h-8 text-purple-500" />
            TRANSACTIONS
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">Financial Audit & Ledger Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Today\'s Volume', value: '₹12,450', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending Payouts', value: '₹3,200', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Refunds Issued', value: '₹840', icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'System Float', value: '₹2.8L', icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

      <TransactionTable key={refreshKey} />
    </div>
  );
}
