'use client';

import { useState, useEffect } from 'react';
import { IUser, UserStatus, KYCStatus, UserType } from '@/types/user';
import { AdminUsersResponse, AdminUserFilters } from '@/types/admin';
import { Button, Input, Select, Badge, cn, TableWrapper, Skeleton, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Clock,
  Wallet,
  Smartphone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import UserEditModal from './UserEditModal';
import UserDetailsModal from './UserDetailsModal';
import { ConfirmModal } from './ConfirmModal';
import { motion } from 'framer-motion';

export default function UserTable() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<AdminUserFilters>({
    search: '',
    userType: undefined,
    kycStatus: undefined,
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.userType) queryParams.set('userType', filters.userType);
      if (filters.kycStatus) queryParams.set('kycStatus', filters.kycStatus);
      if (filters.status) queryParams.set('status', filters.status);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());
      queryParams.set('sortBy', filters.sortBy || 'createdAt');
      queryParams.set('sortOrder', filters.sortOrder || 'desc');

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      const data: AdminUsersResponse = await res.json();
      
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, filters.userType, filters.kycStatus, filters.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case 'Active': return { variant: 'success' as const, icon: CheckCircle2, label: 'Active' };
      case 'Suspended': return { variant: 'warning' as const, icon: Clock, label: 'Suspended', glow: true };
      case 'Banned': return { variant: 'destructive' as const, icon: Ban, label: 'Banned' };
      default: return { variant: 'secondary' as const, icon: UserIcon, label: status };
    }
  };

  const getKYCConfig = (status: KYCStatus) => {
    switch (status) {
      case 'Verified': return { variant: 'success' as const, icon: ShieldCheck, label: 'Verified' };
      case 'Pending': return { variant: 'warning' as const, icon: Clock, label: 'Pending', glow: true };
      case 'Rejected': return { variant: 'destructive' as const, icon: ShieldAlert, label: 'Rejected' };
      case 'Submitted': return { variant: 'premium' as const, icon: ShieldCheck, label: 'In Review', glow: true };
      default: return { variant: 'secondary' as const, icon: Smartphone, label: status };
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-[#121212]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Player Filter Engine</span>
          </div>
          {(filters.userType || filters.status || filters.kycStatus || filters.search) && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '', userType: undefined, kycStatus: undefined, status: undefined });
                setPagination({ ...pagination, page: 1 });
              }}
              className="text-[10px] font-semibold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="p-8">
          <div className="flex flex-col xl:flex-row gap-6">
            <form onSubmit={handleSearch} className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <Input 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search players by name, phone or ID..." 
                className="pl-14 bg-white/[0.03] border-white/5 focus:border-purple-500/50 h-14 rounded-2xl text-base font-medium"
              />
            </form>

            <div className="flex flex-wrap gap-4">
              <Select 
                className="w-full sm:w-44 h-14 rounded-2xl bg-white/[0.03] border-white/5"
                value={filters.userType || ''}
                onChange={(e) => setFilters({ ...filters, userType: e.target.value as UserType || undefined })}
              >
                <option value="">All Roles</option>
                <option value="Player">Players Only</option>
                <option value="Admin">Admins Only</option>
              </Select>

              <Select 
                className="w-full sm:w-44 h-14 rounded-2xl bg-white/[0.03] border-white/5"
                value={filters.kycStatus || ''}
                onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value as KYCStatus || undefined })}
              >
                <option value="">All KYC Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </Select>

              <Select 
                className="w-full sm:w-44 h-14 rounded-2xl bg-white/[0.03] border-white/5"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus || undefined })}
              >
                <option value="">All Account Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
              </Select>

              <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 border-white/5 bg-white/[0.03] hover:bg-white/[0.08]">
                <Download className="w-5 h-5 text-gray-400" /> 
                <span className="hidden sm:inline font-bold text-sm">Export</span>
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
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Identity Profile</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden sm:table-cell">Contact Path</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">Liquid Capital</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden lg:table-cell">KYC Integrity</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 hidden md:table-cell">Life Cycle</th>
              <th className="px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/[0.01]">
                  <td colSpan={6} className="px-8 py-10">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <UserIcon className="w-16 h-16" />
                    <p className="font-bold uppercase tracking-[0.4em] text-sm text-gray-400">Zero Strategic Players Found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const status = getStatusConfig(user.status);
                const kyc = getKYCConfig(user.kycStatus);
                return (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative group/avatar">
                          <Avatar className="w-14 h-14 border-2 border-white/10 group-hover:border-purple-500/30 transition-all duration-500 ring-2 ring-purple-500/5 group-hover:ring-purple-500/10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500/10 to-red-500/10 text-purple-400">
                              {user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0a0a] z-10", user.status === 'Active' ? 'bg-green-500' : 'bg-gray-600')} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-base tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={user.userType === 'Admin' ? 'premium' : 'outline'} className="h-4 px-1.5 py-0 text-[8px]">
                              {user.userType}
                            </Badge>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:inline">ID: {user.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 font-mono text-xs">
                          <Smartphone className="w-3 h-3 text-gray-500" />
                          +91 {user.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/5">
                          <Wallet className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-green-500 text-lg leading-none">₹{user.walletBalance.toLocaleString()}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Available Credit</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <Badge variant={kyc.variant} glow={kyc.glow} className="rounded-xl h-8 px-4 gap-2">
                        <kyc.icon className="w-3 h-3" />
                        {kyc.label}
                      </Badge>
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
                          className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-blue-500 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/5 transition-all duration-300"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/5 transition-all duration-300"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-11 h-11 rounded-2xl bg-white/[0.02] hover:bg-red-600 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-white/5 transition-all duration-300"
                          onClick={() => {
                            setUserToDelete(user);
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
          Showing <span className="text-white">{users.length}</span> of <span className="text-white">{pagination.total}</span> total accounts
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
        title="Destroy Account Integrity"
        description={`This action will permanently delete user ${userToDelete?.name}. All wallet history, battle logs, and identity records will be purged.`}
        confirmLabel="Confirm Purge"
        loading={deleting}
      />
      <UserDetailsModal 
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      <UserEditModal 
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
