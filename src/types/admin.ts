import { IUser, KYCStatus, UserStatus, UserType } from './user';

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

export interface UpdateUserRequest {
  name?: string;
  userType?: UserType;
  status?: UserStatus;
  kycStatus?: KYCStatus;
  walletBalance?: number;
  referralCode?: string;
}
