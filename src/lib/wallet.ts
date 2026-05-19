import prisma from './prisma';
import { TransactionType, TransactionStatus, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

export type Decimal = Prisma.Decimal;

export const walletService = {
  /**
   * Generates a unique transaction ID
   */
  generateTransactionId(prefix: string = 'TXN') {
    return `${prefix}${Date.now()}${nanoid(6).toUpperCase()}`;
  },

  /**
   * Credits money to a user's wallet
   */
  async creditUser(params: {
    userId: string;
    amount: number | Decimal;
    type: TransactionType;
    description: string;
    battleId?: string;
    withdrawalId?: string;
    metadata?: any;
    adminId?: string;
  }) {
    const { userId, amount, type, description, battleId, withdrawalId, metadata, adminId } = params;
    const decimalAmount = new Prisma.Decimal(amount);

    if (decimalAmount.lte(0)) {
      throw new Error('Amount must be greater than zero');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create Transaction Record
      const transaction = await tx.walletTransaction.create({
        data: {
          transactionId: this.generateTransactionId(),
          userId,
          amount: decimalAmount,
          type,
          status: TransactionStatus.SUCCESS,
          description,
          battleId,
          withdrawalId,
          metadata: metadata ? JSON.stringify(metadata) : null,
          adminId,
        },
      });

      // 2. Prepare Update Data
      const updateData: Prisma.UserUpdateInput = {
        walletBalance: { increment: decimalAmount },
      };

      // Update specific counters based on type
      if (type === TransactionType.DEPOSIT) {
        updateData.totalDeposited = { increment: decimalAmount };
      } else if (type === TransactionType.BATTLE_WIN) {
        updateData.totalWinnings = { increment: decimalAmount };
      } else if (type === TransactionType.REFERRAL_COMMISSION) {
        updateData.totalReferralEarnings = { increment: decimalAmount };
      }

      // 3. Update User Balance and Counters
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      return transaction;
    });
  },

  /**
   * Debits money from a user's wallet
   */
  async debitUser(params: {
    userId: string;
    amount: number | Decimal;
    type: TransactionType;
    description: string;
    battleId?: string;
    withdrawalId?: string;
    metadata?: any;
    adminId?: string;
  }) {
    const { userId, amount, type, description, battleId, withdrawalId, metadata, adminId } = params;
    const decimalAmount = new Prisma.Decimal(amount);

    if (decimalAmount.lte(0)) {
      throw new Error('Amount must be greater than zero');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Check current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (!user) throw new Error('User not found');
      if (user.walletBalance.lt(decimalAmount)) {
        throw new Error('Insufficient wallet balance');
      }

      // 2. Create Transaction Record
      const transaction = await tx.walletTransaction.create({
        data: {
          transactionId: this.generateTransactionId(),
          userId,
          amount: decimalAmount,
          type,
          status: TransactionStatus.SUCCESS,
          description,
          battleId,
          withdrawalId,
          metadata: metadata ? JSON.stringify(metadata) : null,
          adminId,
        },
      });

      // 3. Prepare Update Data
      const updateData: Prisma.UserUpdateInput = {
        walletBalance: { decrement: decimalAmount },
      };

      // Update specific counters based on type
      if (type === TransactionType.WITHDRAWAL) {
        updateData.totalWithdrawn = { increment: decimalAmount };
      }

      // 4. Update User Balance and Counters
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      return transaction;
    });
  },

  /**
   * Gets user wallet balance and stats
   */
  async getWalletSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
        totalDeposited: true,
        totalWithdrawn: true,
        totalWinnings: true,
        totalReferralEarnings: true,
      },
    });

    if (!user) throw new Error('User not found');
    return user;
  },

  /**
   * Gets transaction history for a user
   */
  async getTransactionHistory(params: {
    userId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    limit?: number;
    offset?: number;
  }) {
    const { userId, type, status, limit = 20, offset = 0 } = params;

    const where: Prisma.WalletTransactionWhereInput = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          battle: {
            select: { battleId: true }
          },
          admin: {
            select: { name: true }
          }
        }
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { transactions, total };
  }
};
