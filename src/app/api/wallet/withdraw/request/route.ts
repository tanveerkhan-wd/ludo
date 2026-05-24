import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { WithdrawalRequestSchema } from '@/types/withdrawal';
import crypto from 'crypto';
import { walletService } from '@/lib/wallet';
import { TransactionType, NotificationType } from '@prisma/client';
import { notificationService } from '@/lib/notification';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = WithdrawalRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { amount } = validation.data;
    const userId = decoded.id;

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check for existing pending request to prevent spam/duplicates
      const pendingRequest = await tx.withdrawalRequest.findFirst({
        where: { userId, status: 'PENDING' }
      });

      if (pendingRequest) {
        throw new Error('You already have a pending withdrawal request. Please wait for it to be processed.');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          walletBalance: true,
          preferredWithdrawalMethod: true,
          upiId: true,
          bankAccountNumber: true,
          bankIfscCode: true,
          bankAccountHolderName: true,
        }
      });

      if (!user) throw new Error('User not found');
      if (user.walletBalance.lt(amount)) throw new Error('Insufficient balance');

      // Check if user has proper payment details saved
      if (user.preferredWithdrawalMethod === 'UPI' && !user.upiId) {
        throw new Error('Please save your UPI ID before withdrawing');
      }
      if (user.preferredWithdrawalMethod === 'BANK' && (!user.bankAccountNumber || !user.bankIfscCode)) {
        throw new Error('Please save your Bank Details before withdrawing');
      }

      const bankDetailsJson = user.preferredWithdrawalMethod === 'BANK' 
        ? JSON.stringify({
            accountNumber: user.bankAccountNumber,
            ifscCode: user.bankIfscCode,
            accountHolderName: user.bankAccountHolderName
          })
        : null;

      // 1. Deduct balance immediately
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount } }
      });

      // 2. Generate unique Withdrawal ID
      const withdrawalId = `WD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      // 3. Create Withdrawal Request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          withdrawalId,
          userId,
          amount,
          status: 'PENDING',
          preferredMethod: user.preferredWithdrawalMethod,
          upiId: user.upiId,
          bankDetails: bankDetailsJson,
        }
      });

      // 4. Create Wallet Transaction for deduction
      await tx.walletTransaction.create({
        data: {
          transactionId: walletService.generateTransactionId('WD'),
          userId,
          amount,
          type: TransactionType.WITHDRAWAL,
          status: 'PENDING', // Will be SUCCESS when processed, or REFUNDED when rejected
          description: `Withdrawal Request: ${withdrawalId}`,
        }
      });

      return withdrawal;
    });

    // Notify User
    await notificationService.create({
      userId,
      title: "Withdrawal Requested ⏳",
      message: `Your request for ₹${amount} has been submitted. It will be reviewed by admin within 24 hours.`,
      type: NotificationType.WITHDRAWAL_SUBMITTED,
      link: "/wallet"
    });

    return NextResponse.json({ success: true, withdrawal: result });
  } catch (error: any) {
    console.error('WITHDRAWAL_REQUEST_ERROR', error);
    return NextResponse.json({ error: error.message || 'Failed to request withdrawal' }, { status: 400 });
  }
}
