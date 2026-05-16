export type UserType = 'Player' | 'Admin';
export type KYCStatus = 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Banned';

export interface IUser {
  _id: string;
  phone: string;
  name: string;
  avatar?: string;
  userType: UserType;
  password?: string;
  referralCode: string;
  referredBy?: string;
  kycStatus: KYCStatus;
  walletBalance: number;
  totalEarnings: number;
  totalReferralEarnings: number;
  status: UserStatus;
  accountDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastLoginAt?: Date;
  deviceInfo?: string;
  otp?: string;
  otpExpiry?: Date;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}
