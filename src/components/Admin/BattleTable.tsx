'use client';

import { useState, useEffect } from 'react';
import { IBattle, BattleStatus } from '@/types/battle';
import { AdminBattlesResponse, AdminBattleFilters } from '@/types/admin';
import { Button, Input, Select, Badge, cn, TableWrapper, Skeleton } from '@/components/ui';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Swords,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function BattleTable() {
  const router = useRouter();
  const [battles, setBattles] = useState<IBattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<AdminBattleFilters>({
    search: '',
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [battleToDelete, setBattleToDelete] = useState<IBattle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());
      queryParams.set('sortBy', filters.sortBy || 'createdAt');
      queryParams.set('sortOrder', filters.sortOrder || 'desc');

      const res = await fetch(`/api/admin/battles?${queryParams.toString()}`);
      const data: AdminBattlesResponse = await res.json();
      
      setBattles(data.battles);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, [pagination.page, pagination.limit, filters.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchBattles();
  };

  const handleDelete = async () => {
    if (!battleToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/battles/${battleToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Battle deleted successfully');
        setIsDeleteModalOpen(false);
        fetchBattles();
      } else {
        toast.error('Failed to delete battle');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
      setBattleToDelete(null);
    }
  };

  const getStatusConfig = (status: BattleStatus) => {
    switch (status) {
      case 'OPEN': return { variant: 'secondary' as const, icon: Clock, label: 'Open' };
      case 'FULL': return { variant: 'warning' as const, icon: Zap, label: 'Full', glow: true };
      case 'IN_PROGRESS': return { variant: 'info' as const, icon: Swords, label: 'Live', glow: true };
      case 'COMPLETED': return { variant: 'success' as const, icon: CheckCircle2, label: 'Done' };
      case 'CANCELLED': return { variant: 'destructive' as const, icon: XCircle, label: 'Cancelled' };
      case 'DISPUTED': return { variant: 'destructive' as const, icon: ShieldAlert, label: 'Disputed', glow: true };
      case 'ABANDONED': return { variant: 'outline' as const, icon: AlertCircle, label: 'Abandoned' };
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Filter Engine</span>
          </div>
          {(filters.status || filters.search) && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '', status: undefined });
                setPagination({ ...pagination, page: 1 });
              }}
              className="text-[10px] font-semibold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
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
                placeholder="Search Battle ID, Room Code or Players..." 
                className="pl-14 bg-white/[0.03] border-white/5 focus:border-purple-500/50 h-14 rounded-2xl text-base font-medium"
              />
            </form>

            <div className="flex flex-wrap gap-4">
              <Select 
                className="w-full sm:w-56 h-14 rounded-2xl bg-white/[0.03] border-white/5"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as BattleStatus || undefined })}
              >
                <option value="">All Battle Status</option>
                <option value="OPEN">Open (Waiting)</option>
                <option value="FULL">Full (Ready)</option>
                <option value="IN_PROGRESS">In Progress (Live)</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPUTED">Disputed (Review)</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ABANDONED">Abandoned</option>
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
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Battle Intelligence</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden sm:table-cell">Contestants</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Economic Value</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden lg:table-cell">Ludo Protocol</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden md:table-cell">Real-time Status</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 text-right font-bold">Management</th>
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
            ) : battles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <Swords className="w-16 h-16" />
                    <p className="font-bold uppercase tracking-[0.4em] text-sm text-gray-400">Zero Strategic Battles Found</p>
                  </div>
                </td>
              </tr>
            ) : (
              battles.map((battle) => {
                const status = getStatusConfig(battle.status);
                return (
                  <motion.tr 
                    key={battle.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-purple-500/10 to-red-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:border-purple-500/30">
                          <Swords className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-base tracking-tight">{battle.battleId}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(battle.createdAt).toLocaleDateString()}</span>
                            {battle.disputed && (
                              <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden sm:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                          <p className="text-xs font-semibold text-white truncate max-w-[140px] uppercase tracking-tighter">
                            {battle.creator?.name || 'Unknown'}
                          </p>
                        </div>
                        {battle.opponent && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                            <p className="text-xs font-semibold text-white truncate max-w-[140px] uppercase tracking-tighter">
                              {battle.opponent.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-base">₹{battle.entryFee.toLocaleString()}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Prize: ₹{battle.prizeAmount.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2 group/code cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(battle.roomCode);
                        toast.success('Room code copied');
                      }}>
                        <code className="bg-white/5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-purple-400 border border-white/5 group-hover/code:bg-purple-500/20 group-hover/code:text-white transition-all">
                          {battle.roomCode}
                        </code>
                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover/code:text-white transition-colors" />
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <Badge variant={status.variant} glow={status.glow} className="rounded-xl h-8 px-4 gap-2">
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/5 transition-all duration-300"
                          onClick={() => router.push(`/admin/battles/${battle.id}`)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-red-600 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-white/5 transition-all duration-300"
                          onClick={() => {
                            setBattleToDelete(battle);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 order-2 sm:order-1">
          Showing <span className="text-white">{battles.length}</span> of <span className="text-white">{pagination.total}</span> tactical games
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
          
          <div className="hidden md:flex items-center gap-2">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => (
              <Button
                key={i}
                variant={pagination.page === i + 1 ? 'premium' : 'ghost'}
                size="icon"
                onClick={() => setPagination({ ...pagination, page: i + 1 })}
                className="w-11 h-11 rounded-xl font-bold text-xs"
              >
                {i + 1}
              </Button>
            ))}
          </div>

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

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Destroy Match Intelligence"
        description={`This action will permanently delete battle ${battleToDelete?.battleId}. This operation is irreversible and will remove all audit trails.`}
        confirmLabel="Confirm Destruction"
        loading={deleting}
      />
    </div>
  );
}
