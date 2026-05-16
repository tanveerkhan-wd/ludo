import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types/user';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: function(this: any) {
        if (!this.phone) return 'Player';
        return `Player${this.phone.slice(-4)}`;
      }
    },
    avatar: {
      type: String,
    },
    userType: {
      type: String,
      enum: ['Player', 'Admin'],
      default: 'Player',
    },
    password: {
      type: String,
      select: false,
    },
    referralCode: {
      type: String,
      unique: true,
      index: true,
      default: function() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    kycStatus: {
      type: String,
      enum: ['Pending', 'Submitted', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalReferralEarnings: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Banned'],
      default: 'Active',
    },
    accountDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    deviceInfo: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
