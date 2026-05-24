export type UserType = 'Player' | 'Admin';
export type KYCStatus = 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Banned';

export interface IUser {
  id: string;
  _id?: string; // Optional for backward compatibility in some responses
  phone: string;
  name: string;
  avatar?: string | null;
  userType: string;
  password?: string | null;
  referralCode: string;
  referredById?: string | null;
  kyc?: {
    id: string;
    kycStatus: string;
  } | null;
  
  // Financial Fields
  walletBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWinnings: number;
  totalReferralEarnings: number;
  
  status: string;
  accountDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  lastLoginAt?: Date | null;
  deviceInfo?: string | null;
  otp?: string | null;
  otpExpiry?: Date | null;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}
