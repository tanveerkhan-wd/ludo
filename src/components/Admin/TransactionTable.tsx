'use client';

import { useState, useEffect } from 'react';
import { ITransaction, AdminTransactionFilters, AdminTransactionsResponse } from '@/types/admin';
import { 
  Button, 
  Input, 
  Select, 
  Badge, 
  cn, 
  TableWrapper, 
  Skeleton,
  Modal
} from '@/components/ui';
import { 
  Search, 
  Filter, 
  Eye, 
  Download,
  ChevronLeft, 
  ChevronRight,
  ReceiptText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [filters, setFilters] = useState<AdminTransactionFilters>({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all',
  });

  const [selectedTx, setSelectedTx] = useState<ITransaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) {
        // Simple logic to detect if search is a phone number or transaction ID
        if (filters.search.length >= 10 && !isNaN(Number(filters.search))) {
          queryParams.set('phone', filters.search);
        } else {
          queryParams.set('transactionId', filters.search);
        }
      }
      if (filters.type && filters.type !== 'all') queryParams.set('type', filters.type);
      if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status);
      
      // Note: dateRange filtering might need backend support if not already there
      // For now we'll pass it and see if the backend handles it or we'll update backend
      if (filters.dateRange && filters.dateRange !== 'all') queryParams.set('dateRange', filters.dateRange);
      
      queryParams.set('limit', limit.toString());
      queryParams.set('offset', ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/transactions?${queryParams.toString()}`);
      const data: AdminTransactionsResponse = await res.json();
      
      if (res.ok) {
        setTransactions(data.transactions);
        setTotal(data.total);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filters.type, filters.status, filters.dateRange]);

  const handleUpdateStatus = async () => {
    if (!selectedTx || !newStatus || newStatus === selectedTx.status) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTx.id,
          status: newStatus
        })
      });

      if (res.ok) {
        toast.success('Transaction status updated successfully');
        setIsDetailsOpen(false);
        fetchTransactions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Transaction ID', 'User', 'Phone', 'Type', 'Amount', 'Status', 'Description', 'Date'];
    const rows = transactions.map(tx => [
      tx.transactionId,
      tx.user.name,
      tx.user.phone,
      tx.type,
      tx.amount,
      tx.status,
      tx.description,
      new Date(tx.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success" className="gap-1.5"><CheckCircle2 className="w-3 h-3" /> Success</Badge>;
      case 'PENDING':
        return <Badge variant="warning" className="gap-1.5"><Clock className="w-3 h-3 animate-pulse" /> Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="gap-1.5"><XCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('WIN') || type.includes('CREDIT')) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (type.includes('JOIN') || type.includes('DEBIT') || type.includes('WITHDRAWAL')) return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
    return <ReceiptText className="w-4 h-4 text-blue-500" />;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center justify-between bg-[#121212]/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-1 gap-4 w-full xl:max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
            <Input 
              placeholder="Search Phone or Tx ID..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 transition-all"
            />
          </div>
          <Button type="submit" variant="outline" className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </form>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <Select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="h-12 min-w-[160px] rounded-2xl bg-white/5 border-white/10"
          >
            <option value="all">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="BATTLE_JOIN">Battle Joins</option>
            <option value="BATTLE_WIN">Battle Wins</option>
            <option value="REFERRAL_COMMISSION">Referrals</option>
            <option value="ADMIN_CREDIT">Admin Credits</option>
            <option value="ADMIN_DEBIT">Admin Debits</option>
          </Select>

          <Select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="h-12 min-w-[140px] rounded-2xl bg-white/5 border-white/10"
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </Select>

          <Select 
            value={filters.dateRange} 
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="h-12 min-w-[140px] rounded-2xl bg-white/5 border-white/10"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </Select>

          <Button 
            onClick={exportToCSV}
            variant="outline" 
            className="h-12 px-5 rounded-2xl gap-2 font-bold text-xs uppercase tracking-widest bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Download className="w-4 h-4 text-purple-400" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableWrapper className="border-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Transaction ID</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Player</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Type</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Amount</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Date</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-8 py-6"><Skeleton className="h-6 w-full rounded-lg" /></td>
                  ))}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <ReceiptText className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-400">No Transactions Found</h3>
                      <p className="text-sm text-gray-600">Try adjusting your filters or search term</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-mono text-xs text-purple-400 font-bold tracking-tighter uppercase">{tx.transactionId}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{tx.user.name}</span>
                      <span className="text-xs text-gray-500 font-mono">+91 {tx.user.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{tx.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "text-sm font-bold",
                      tx.type.includes('WIN') || tx.type.includes('CREDIT') || tx.type === 'DEPOSIT' ? "text-green-500" : "text-red-500"
                    )}>
                      {tx.type.includes('WIN') || tx.type.includes('CREDIT') || tx.type === 'DEPOSIT' ? '+' : '-'} ₹{parseFloat(tx.amount as any).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      <span className="text-[10px] text-gray-600">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-purple-600/20 hover:text-purple-400"
                      onClick={() => {
                        setSelectedTx(tx);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium tracking-tight">
              Showing <span className="text-white font-bold">{transactions.length}</span> of <span className="text-white font-bold">{total}</span> records
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 w-10 p-0 border-white/5"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-purple-400">
                {page} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 w-10 p-0 border-white/5"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </TableWrapper>

      {/* Transaction Details Modal */}
      <Modal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        title="Transaction Details"
        className="max-w-2xl"
      >
        {selectedTx && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center border border-purple-500/20">
                  {getTypeIcon(selectedTx.type)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg tracking-tight">{selectedTx.type.replace('_', ' ')}</h4>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">{selectedTx.transactionId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-black",
                  selectedTx.type.includes('WIN') || selectedTx.type.includes('CREDIT') || selectedTx.type === 'DEPOSIT' ? "text-green-500" : "text-red-500"
                )}>
                  {selectedTx.type.includes('WIN') || selectedTx.type.includes('CREDIT') || selectedTx.type === 'DEPOSIT' ? '+' : '-'} ₹{parseFloat(selectedTx.amount as any).toFixed(2)}
                </p>
                {getStatusBadge(selectedTx.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Player Information
                  </h5>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Name</span>
                      <span className="text-xs font-bold text-white">{selectedTx.user.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Phone</span>
                      <span className="text-xs font-mono text-white">+91 {selectedTx.user.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Timeline
                  </h5>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Created At</span>
                      <span className="text-xs font-bold text-white">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <ReceiptText className="w-3 h-3" /> Description & Links
                  </h5>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <p className="text-xs text-gray-300 leading-relaxed italic">"{selectedTx.description}"</p>
                    {selectedTx.battleId && (
                      <div className="pt-2 border-t border-white/5">
                        <Button 
                          variant="premium" 
                          size="sm" 
                          className="w-full gap-2 rounded-xl text-[10px]"
                          onClick={() => window.open(`/admin/battles/${selectedTx.battleId}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" /> View Battle #{selectedTx.battle?.battleId}
                        </Button>
                      </div>
                    )}
                    {selectedTx.admin && (
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Processed By</span>
                        <Badge variant="premium" className="text-[10px]">{selectedTx.admin.name}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Select 
                  value={newStatus || selectedTx.status} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 rounded-2xl"
                >
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </Select>
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={updating || (newStatus || selectedTx.status) === selectedTx.status}
                  variant="premium"
                  className="h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest min-w-[140px]"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-2xl px-8 h-12 font-bold uppercase tracking-widest text-xs border-white/10">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
