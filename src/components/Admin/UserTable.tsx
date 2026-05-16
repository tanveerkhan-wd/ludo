'use client';

import { useState, useEffect } from 'react';
import { IUser, UserStatus, KYCStatus, UserType } from '@/types/user';
import { AdminUsersResponse, AdminUserFilters } from '@/types/admin';
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
  User as UserIcon,
  Ban,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import UserEditModal from './UserEditModal';
import UserDetailsModal from './UserDetailsModal';

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

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to soft delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Suspended': return 'warning';
      case 'Banned': return 'destructive';
      default: return 'secondary';
    }
  };

  const getKYCVariant = (status: KYCStatus) => {
    switch (status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'destructive';
      case 'Submitted': return 'outline';
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
          {(filters.userType || filters.status || filters.kycStatus || filters.search) && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '', userType: undefined, kycStatus: undefined, status: undefined });
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
                placeholder="Search by name or phone..." 
                className="pl-12"
              />
            </form>

            <div className="flex flex-wrap gap-3">
              <Select 
                className="w-full sm:w-40"
                value={filters.userType || ''}
                onChange={(e) => setFilters({ ...filters, userType: e.target.value as UserType || undefined })}
              >
                <option value="">All Roles</option>
                <option value="Player">Player</option>
                <option value="Admin">Admin</option>
              </Select>

              <Select 
                className="w-full sm:w-40"
                value={filters.kycStatus || ''}
                onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value as KYCStatus || undefined })}
              >
                <option value="">All KYC</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </Select>

              <Select 
                className="w-full sm:w-40"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus || undefined })}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
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
                <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden sm:table-cell">Phone</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Balance</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 hidden lg:table-cell">KYC</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-red-500/20 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-all shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-sm md:text-base">{user.name}</p>
                          <p className="text-[9px] md:text-[10px] text-purple-500 uppercase font-bold tracking-wider">{user.userType}</p>
                          {/* Mobile-only info */}
                          <div className="sm:hidden mt-0.5 space-x-2">
                            <span className="text-[10px] text-gray-500">{user.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono hidden sm:table-cell">+91 {user.phone}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-500 text-sm md:text-base">₹{user.walletBalance.toLocaleString()}</p>
                      <div className="lg:hidden mt-1">
                         <Badge variant={getKYCVariant(user.kycStatus)} className="text-[9px] px-1.5 py-0">
                          KYC: {user.kycStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <Badge variant={getKYCVariant(user.kycStatus)} className="rounded-lg">
                        {user.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge variant={getStatusVariant(user.status)} className="rounded-lg">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 hidden xl:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 md:w-10 md:h-10 hover:bg-blue-500/10 hover:text-blue-500"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 md:w-10 md:h-10 hover:bg-purple-500/10 hover:text-purple-500"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 md:w-10 md:h-10 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleDelete(user._id)}
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
            Showing <span className="text-white font-medium">{users.length}</span> of <span className="text-white font-medium">{pagination.total}</span> users
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
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
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
