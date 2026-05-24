import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { AdminWithdrawalActionSchema } from '@/types/withdrawal';
import { walletService } from '@/lib/wallet';
import { TransactionType, NotificationType } from '@prisma/client';
import { notificationService } from '@/lib/notification';

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
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
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

      return await tx.withdrawalRequest.update({
        where: { id },
        data: updateData
      });
    });

    // Notify User (Async / Post-transaction)
    try {
      if (status === 'APPROVED') {
        await notificationService.create({
          userId: result.userId,
          title: "Withdrawal Approved! 💸",
          message: `Your withdrawal of ₹${result.amount} has been approved and is being processed.`,
          type: NotificationType.WITHDRAWAL_APPROVED,
          link: "/wallet"
        });
      } else if (status === 'REJECTED') {
        await notificationService.create({
          userId: result.userId,
          title: "Withdrawal Rejected ❌",
          message: `Your withdrawal request of ₹${result.amount} was rejected. Reason: ${rejectionReason || 'Policy Violation'}. Amount refunded to wallet.`,
          type: NotificationType.WITHDRAWAL_REJECTED,
          link: "/wallet"
        });
      } else if (status === 'PROCESSED') {
        await notificationService.create({
          userId: result.userId,
          title: "Payout Successful! 🎉",
          message: `₹${result.amount} has been successfully sent to your account. Check your bank/UPI.`,
          type: NotificationType.WITHDRAWAL_APPROVED,
          link: "/wallet"
        });
      }
    } catch (notifErr) {
      console.error('NOTIFY_WITHDRAWAL_UPDATE_ERROR', notifErr);
    }

    return NextResponse.json({ success: true, withdrawal: result });
  } catch (error: any) {
    console.error('WITHDRAWAL_STATUS_UPDATE_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
