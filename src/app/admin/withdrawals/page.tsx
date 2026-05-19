'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Select, 
  Badge, 
  TableWrapper, 
  Skeleton,
  cn
} from '@/components/ui';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/admin/withdrawals?${queryParams.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setWithdrawals(data.withdrawals);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, pagination.limit, filters.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchWithdrawals();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { variant: 'warning' as const, icon: Clock, label: 'Pending' };
      case 'APPROVED': return { variant: 'info' as const, icon: CheckCircle2, label: 'Approved', glow: true };
      case 'PROCESSED': return { variant: 'success' as const, icon: CheckCircle2, label: 'Processed' };
      case 'REJECTED': return { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' };
      case 'FAILED': return { variant: 'destructive' as const, icon: AlertCircle, label: 'Failed' };
      default: return { variant: 'secondary' as const, icon: Clock, label: status };
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-[#121212]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Filter Engine</span>
          </div>
          {(filters.status || filters.search) && (
            <button
              onClick={() => {
                setFilters({ search: '', status: '' });
                setPagination({ ...pagination, page: 1 });
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <form onSubmit={handleSearch} className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <Input 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search ID, Phone or Name..." 
                className="pl-14 bg-white/[0.03] border-white/5 focus:border-purple-500/50 h-14 rounded-2xl text-base font-medium"
              />
            </form>

            <div className="flex flex-wrap gap-4">
              <Select 
                className="w-full sm:w-56 h-14 rounded-2xl bg-white/[0.03] border-white/5"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved (Awaiting Payout)</option>
                <option value="PROCESSED">Processed (Paid)</option>
                <option value="REJECTED">Rejected</option>
              </Select>

              <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 border-white/5 bg-white/[0.03] hover:bg-white/[0.08]">
                <Download className="w-5 h-5 text-gray-400" /> 
                <span className="hidden sm:inline font-bold">Export CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <TableWrapper>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Transaction ID</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Player</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Amount</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hidden lg:table-cell">Method</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hidden md:table-cell">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/[0.01]">
                  <td colSpan={6} className="px-8 py-10">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <ArrowUpRight className="w-16 h-16" />
                    <p className="font-bold uppercase tracking-[0.4em] text-sm text-gray-400">No Withdrawal Requests Found</p>
                  </div>
                </td>
              </tr>
            ) : (
              withdrawals.map((req) => {
                const status = getStatusConfig(req.status);
                return (
                  <motion.tr 
                    key={req.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-white/5 flex items-center justify-center border border-white/5">
                          <ArrowUpRight className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white tracking-tight">{req.withdrawalId}</p>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">{new Date(req.requestedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm text-white truncate max-w-[140px] uppercase tracking-tighter">
                        {req.user.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{req.user.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-white text-lg tracking-tighter">₹{req.amount}</p>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <Badge variant="outline" className="rounded-lg h-6 px-3 text-[9px] font-bold">
                        {req.preferredMethod}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <Badge variant={status.variant} glow={status.glow} className="rounded-xl h-8 px-4 gap-2">
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/5 transition-all duration-300 ml-auto"
                        onClick={() => router.push(`/admin/withdrawals/${req.id}`)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* Pagination */}
      <div className="px-10 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.01] rounded-[2rem]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 order-2 sm:order-1">
          Showing <span className="text-white">{withdrawals.length}</span> of <span className="text-white">{pagination.total}</span> requests
        </p>
        <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={pagination.page === 1 || loading}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="h-11 px-5 rounded-xl gap-2 font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={pagination.page === pagination.totalPages || loading}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="h-11 px-5 rounded-xl gap-2 font-bold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
