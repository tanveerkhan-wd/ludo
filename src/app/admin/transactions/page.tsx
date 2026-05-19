'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select, Badge, Skeleton } from '@/components/ui';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    phone: '',
    transactionId: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.type, filters.status]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...filters,
        offset: ((filters.page - 1) * filters.limit).toString(),
        limit: filters.limit.toString()
      } as any).toString();

      const res = await fetch(`/api/admin/transactions?${query}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchTransactions();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'User', 'Phone', 'Type', 'Amount', 'Description', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleString(),
      t.transactionId,
      t.user?.name || 'N/A',
      t.user?.phone || 'N/A',
      t.type,
      t.amount,
      t.description,
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionIcon = (type: string) => {
    if (['DEPOSIT', 'BATTLE_WIN', 'REFUND', 'REFERRAL_COMMISSION', 'ADMIN_CREDIT'].includes(type)) {
      return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Transactions</h1>
          <p className="text-muted-foreground">Monitor all money movements across the platform.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportToCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search User</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Phone number..."
                  className="pl-8"
                  value={filters.phone}
                  onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction ID</label>
              <Input
                placeholder="TXN..."
                value={filters.transactionId}
                onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="BATTLE_JOIN">Battle Join</option>
                <option value="BATTLE_WIN">Battle Win</option>
                <option value="REFUND">Refund</option>
                <option value="REFERRAL_COMMISSION">Referral</option>
                <option value="ADMIN_CREDIT">Admin Credit</option>
                <option value="ADMIN_DEBIT">Admin Debit</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit" className="w-full">Apply Filters</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFilters({ type: '', status: '', phone: '', transactionId: '', page: 1, limit: 20 })}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-bold">Transaction ID</th>
                  <th className="text-left p-4 font-bold">User</th>
                  <th className="text-left p-4 font-bold">Type</th>
                  <th className="text-left p-4 font-bold">Amount</th>
                  <th className="text-left p-4 font-bold">Description</th>
                  <th className="text-left p-4 font-bold">Date</th>
                  <th className="text-left p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={7} className="p-4"><Skeleton className="h-6 w-full" /></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No transactions found matching the filters.</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs">{t.transactionId}</td>
                      <td className="p-4">
                        <p className="font-bold">{t.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{t.user?.phone}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="gap-1">
                          {getTransactionIcon(t.type)}
                          {t.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${
                          ['DEPOSIT', 'BATTLE_WIN', 'REFUND', 'REFERRAL_COMMISSION', 'ADMIN_CREDIT'].includes(t.type)
                          ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {['DEPOSIT', 'BATTLE_WIN', 'REFUND', 'REFERRAL_COMMISSION', 'ADMIN_CREDIT'].includes(t.type) ? '+' : '-'}
                          ₹{parseFloat(t.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 max-w-[200px] truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={t.status === 'SUCCESS' ? 'success' : t.status === 'FAILED' ? 'destructive' : 'warning'}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 flex items-center justify-between border-t">
            <p className="text-xs text-muted-foreground">
              Showing {(filters.page - 1) * filters.limit + 1} to {Math.min(filters.page * filters.limit, total)} of {total} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-bold w-8 text-center">{filters.page}</div>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page * filters.limit >= total}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
