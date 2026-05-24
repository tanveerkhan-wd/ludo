import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { AdminWithdrawalActionSchema } from '@/types/withdrawal';
import { walletService } from '@/lib/wallet';
import { TransactionType } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = AdminWithdrawalActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { status, rejectionReason, notes } = validation.data;
    const adminId = decoded.id;

    const result = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id } });
      if (!withdrawal) throw new Error('Withdrawal not found');

      // Prevent processing a final state
      if (['REJECTED', 'PROCESSED', 'FAILED'].includes(withdrawal.status)) {
        throw new Error(`Cannot change status of a ${withdrawal.status} withdrawal`);
      }

      const updateData: any = {
        status,
        notes: notes || withdrawal.notes,
        processedById: adminId,
        processedAt: new Date()
      };

      if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason;

        // Refund the user
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { walletBalance: { increment: withdrawal.amount } }
        });

        // Add refund transaction
        await tx.walletTransaction.create({
          data: {
            transactionId: walletService.generateTransactionId('REF'),
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: TransactionType.REFUND,
            status: 'SUCCESS',
            description: `Refund: Rejected Withdrawal ${withdrawal.withdrawalId}`
          }
        });
      }

      // If approved or processed, the money is already deducted from wallet, we just update the status
      // We might want to update the original wallet transaction status if we linked it, 
      // but finding it by description is brittle. We'll leave it as PENDING and 
      // rely on the withdrawal request status as the source of truth for the payout.

      return await tx.withdrawalRequest.update({
        where: { id },
        data: updateData
      });
    });

    return NextResponse.json({ success: true, withdrawal: result });
  } catch (error: any) {
    console.error('WITHDRAWAL_STATUS_UPDATE_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
