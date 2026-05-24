import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { zapupiService } from '@/lib/zapupi';
import prisma from '@/lib/prisma';
import { TransactionStatus, Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { transactionId } = await req.json();
    if (!transactionId) return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });

    // 1. Find the transaction in our DB
    const transaction = await prisma.walletTransaction.findUnique({
      where: { transactionId },
      include: { user: true }
    });

    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (transaction.userId !== decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // If already successful, just return
    if (transaction.status === TransactionStatus.SUCCESS) {
      return NextResponse.json({ success: true, status: 'SUCCESS', message: 'Payment already verified' });
    }

    // 2. Fetch Gateway Settings
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
    const zapKey = settings?.zapupiKey || process.env.ZAPUPI_KEY;

    if (!zapKey) return NextResponse.json({ error: 'ZapUPI Key not configured' }, { status: 500 });

    // 3. Check status with ZapUPI
    const zapResponse = await zapupiService.checkOrderStatus(transactionId, zapKey);

    if (zapResponse.status === 'success' && zapResponse.data.status === 'Success') {
      const actualAmount = new Prisma.Decimal(zapResponse.data.pay_amount || zapResponse.data.amount);

      // 4. Update Database (Atomic)
      await prisma.$transaction(async (tx) => {
        // Re-check status inside transaction to prevent race conditions
        const currentTx = await tx.walletTransaction.findUnique({ 
          where: { id: transaction.id },
          select: { status: true }
        });

        if (currentTx?.status === TransactionStatus.SUCCESS) return;

        // Update Transaction
        await tx.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.SUCCESS,
            amount: actualAmount,
            metadata: JSON.stringify({
              ...JSON.parse(transaction.metadata || '{}'),
              gateway_txn_id: zapResponse.data.txn_id,
              utr: zapResponse.data.utr,
              verifiedAt: new Date().toISOString(),
              verificationMethod: 'API_CHECK'
            })
          }
        });

        // Update User Balance
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            walletBalance: { increment: actualAmount },
            totalDeposited: { increment: actualAmount }
          }
        });
      });

      return NextResponse.json({ success: true, status: 'SUCCESS', amount: actualAmount.toString() });
    } else if (zapResponse.data?.status === 'Failed') {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED }
      });
      return NextResponse.json({ success: true, status: 'FAILED' });
    }

    return NextResponse.json({ success: true, status: zapResponse.data?.status || 'PENDING' });
  } catch (error: any) {
    console.error('DEPOSIT_VERIFY_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
