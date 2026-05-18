import { PrismaClient, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export const walletService = {
  async updateBalance(
    userId: string,
    amount: Decimal,
    type: TransactionType,
    battleId?: string,
    description?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Transaction Record
      await tx.walletTransaction.create({
        data: {
          userId,
          battleId,
          amount,
          type,
          description,
          status: 'SUCCESS',
        },
      });

      // 2. Update User Balance
      const multiplier = type === 'CREDIT' ? 1 : -1;
      const adjustment = amount.mul(multiplier);

      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: adjustment },
        },
      });
    });
  },
};
