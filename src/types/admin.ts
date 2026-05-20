import { IUser, KYCStatus, UserStatus, UserType } from './user';
import { IBattle, BattleStatus } from './battle';

export interface AdminUserFilters {
  search?: string;
  userType?: UserType;
  kycStatus?: KYCStatus;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUsersResponse {
  users: IUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminBattleFilters {
  search?: string;
  status?: BattleStatus;
  minFee?: number;
  maxFee?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminBattlesResponse {
  battles: IBattle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  name?: string;
  userType?: UserType;
  status?: UserStatus;
  kycStatus?: KYCStatus;
  walletBalance?: number;
  referralCode?: string;
}

export interface AdminTransactionFilters {
  search?: string;
  type?: string;
  status?: string;
  dateRange?: 'today' | '7d' | '30d' | 'all';
  page?: number;
  limit?: number;
}

export interface ITransaction {
  id: string;
  transactionId: string;
  userId: string;
  user: {
    name: string;
    phone: string;
  };
  amount: number;
  type: string;
  status: string;
  description: string;
  battleId?: string;
  battle?: {
    battleId: string;
  };
  adminId?: string;
  admin?: {
    name: string;
  };
  createdAt: string;
}

export interface AdminTransactionsResponse {
  transactions: ITransaction[];
  total: number;
}
