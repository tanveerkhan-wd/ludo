'use client';

import { useState, useEffect } from 'react';
import { IBattle, BattleStatus } from '@/types/battle';
import { AdminBattlesResponse, AdminBattleFilters } from '@/types/admin';
import { Button, Input, Select, Badge, cn } from '@/components/ui';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Swords,
  Trophy,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import BattleDetailsModal from './BattleDetailsModal';
import { ConfirmModal } from './ConfirmModal';

import { useRouter } from 'next/navigation';

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

  const [selectedBattle, setSelectedBattle] = useState<IBattle | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

  const getStatusVariant = (status: BattleStatus) => {
    switch (status) {
      case 'OPEN': return 'secondary';
      case 'FULL': return 'warning';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'destructive';
      case 'DISPUTED': return 'warning';
      case 'ABANDONED': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
          <Filter className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Filters</span>
          {(filters.status || filters.search) && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '', status: undefined });
                setPagination({ ...pagination, page: 1 });
              }}
              className="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by Battle ID, Room Code or Player..." 
                className="pl-12"
              />
            </form>

            <div className="flex flex-wrap gap-3">
              <Select 
                className="w-full sm:w-48"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as BattleStatus || undefined })}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="FULL">Full</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPUTED">Disputed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ABANDONED">Abandoned</option>
              </Select>

              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-400">Battle</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden sm:table-cell">Players</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Entry / Prize</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden lg:table-cell">Room Code</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden md:table-cell">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden xl:table-cell">Created At</th>
                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : battles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No battles found matching your criteria.
                  </td>
                </tr>
              ) : (
                battles.map((battle) => (
                  <tr key={battle.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-red-500/20 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-all shrink-0">
                          <Swords className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-sm md:text-base">{battle.battleId}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {battle.disputed && (
                              <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5">DISPUTE</Badge>
                            )}
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{battle.status}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-white truncate max-w-[120px]">
                          <span className="text-gray-500 mr-1">C:</span> {battle.creator?.name || 'Unknown'}
                        </p>
                        {battle.opponent && (
                          <p className="text-xs text-white truncate max-w-[120px]">
                            <span className="text-gray-500 mr-1">O:</span> {battle.opponent.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-sm">₹{battle.entryFee.toLocaleString()}</p>
                      <p className="text-[10px] text-green-500 font-bold">Prize: ₹{battle.prizeAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <code className="bg-white/5 px-2 py-1 rounded text-xs font-mono text-purple-400 border border-white/5">
                        {battle.roomCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge variant={getStatusVariant(battle.status)} className="rounded-lg">
                        {battle.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 hidden xl:table-cell">
                      {new Date(battle.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 md:w-10 md:h-10 hover:bg-blue-500/10 hover:text-blue-500"
                          onClick={() => {
                            router.push(`/admin/battles/${battle.id}`);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 md:w-10 md:h-10 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => {
                            setBattleToDelete(battle);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Showing <span className="text-white font-medium">{battles.length}</span> of <span className="text-white font-medium">{pagination.total}</span> battles
          </p>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  className="w-8 h-8 rounded-lg"
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
              className="px-4"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Battle"
        description={`Are you sure you want to delete battle ${battleToDelete?.battleId}? This action is irreversible.`}
        confirmLabel="Delete Battle"
        loading={deleting}
      />
      
      {isViewModalOpen && selectedBattle && (
        <BattleDetailsModal 
          battle={selectedBattle}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          onUpdate={fetchBattles}
        />
      )}
    </div>
  );
}
