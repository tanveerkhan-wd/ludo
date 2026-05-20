import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionStatus, TransactionType, Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('PAYMENT_WEBHOOK_RECEIVED', data);

    const { order_id, status, txn_id, pay_amount, utr } = data;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find the pending transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { transactionId: order_id },
      include: { user: true }
    });

    if (!transaction) {
      console.warn(`Transaction not found for order_id: ${order_id}`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      console.warn(`Transaction ${order_id} is already processed with status: ${transaction.status}`);
      return NextResponse.json({ message: 'Already processed' });
    }

    if (status === 'Success') {
      const actualAmount = new Prisma.Decimal(pay_amount || transaction.amount);

      await prisma.$transaction(async (tx) => {
        // 1. Update Transaction
        await tx.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.SUCCESS,
            amount: actualAmount, // Update if pay_amount is different
            metadata: JSON.stringify({
              ...JSON.parse(transaction.metadata || '{}'),
              gateway_txn_id: txn_id,
              utr: utr,
              processedAt: new Date().toISOString()
            })
          }
        });

        // 2. Update User Balance
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            walletBalance: { increment: actualAmount },
            totalDeposited: { increment: actualAmount }
          }
        });
      });

      console.log(`Successfully processed deposit for order_id: ${order_id}`);
    } else {
      // Handle Failure
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            gateway_txn_id: txn_id,
            error: data.message || 'Payment failed'
          })
        }
      });
      console.log(`Marked deposit as FAILED for order_id: ${order_id}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('PAYMENT_WEBHOOK_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
