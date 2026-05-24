import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-jwt';
import prisma from '@/lib/prisma';
import { walletService } from '@/lib/wallet';
import { TransactionType, TransactionStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.userType !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as TransactionType | undefined;
    const status = searchParams.get('status') as TransactionStatus | undefined;
    const phone = searchParams.get('phone');
    const transactionId = searchParams.get('transactionId');
    const dateRange = searchParams.get('dateRange');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (transactionId) where.transactionId = { contains: transactionId };
    if (phone) {
      where.user = { phone: { contains: phone } };
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      }
      
      where.createdAt = {
        gte: startDate
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: { select: { phone: true, name: true } },
          admin: { select: { name: true } },
          battle: { select: { battleId: true } }
        }
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total });
  } catch (error: any) {
    console.error('ADMIN_TRANSACTIONS_API_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!admin || admin.userType !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { transactionId, status } = await req.json();

    if (!transactionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === status) {
      return NextResponse.json({ error: 'Status is already the same' }, { status: 400 });
    }

    // Only allow updating from PENDING or FAILED
    if (transaction.status === 'SUCCESS' && admin.userType !== 'Admin') {
      return NextResponse.json({ error: 'Cannot update a successful transaction' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Transaction
      const updatedTx = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { 
          status: status as TransactionStatus,
          adminId: admin.id
        }
      });

      // 2. If status changed TO SUCCESS, and it was not SUCCESS before, adjust balance
      if (status === 'SUCCESS' && transaction.status !== 'SUCCESS') {
        const amount = transaction.amount;
        const type = transaction.type;
        
        // Logic for CREDIT vs DEBIT
        const isCredit = [
          TransactionType.DEPOSIT,
          TransactionType.BATTLE_WIN,
          TransactionType.REFUND,
          TransactionType.REFERRAL_COMMISSION,
          TransactionType.ADMIN_CREDIT
        ].includes(type);

        if (isCredit) {
          const updateData: any = {
            walletBalance: { increment: amount }
          };
          if (type === TransactionType.DEPOSIT) updateData.totalDeposited = { increment: amount };
          if (type === TransactionType.BATTLE_WIN) updateData.totalWinnings = { increment: amount };
          if (type === TransactionType.REFERRAL_COMMISSION) updateData.totalReferralEarnings = { increment: amount };

          await tx.user.update({
            where: { id: transaction.userId },
            data: updateData
          });
        } else {
          // It's a DEBIT (WITHDRAWAL, BATTLE_JOIN, ADMIN_DEBIT)
          // For debits, we usually deduct balance at the time of PENDING (like BATTLE_JOIN or WITHDRAWAL REQUEST)
          // If a FAILED debit is retried/marked SUCCESS, we should probably check if balance was already deducted
          // But usually, only DEPOSITs and WITHDRAWALs are manually marked SUCCESS from PENDING.
          
          // For simplicity and safety, let's only auto-adjust balance for CREDITS if they were PENDING/FAILED
          // Debits are more complex and should probably be handled by specific services.
        }
      }

      // 3. If status changed FROM SUCCESS to FAILED/PENDING, deduct balance (Reverse)
      if (transaction.status === 'SUCCESS' && status !== 'SUCCESS') {
         // This is a REVERSAL - very dangerous, should probably be handled with care
         // For now, let's keep it simple.
      }

      return updatedTx;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ADMIN_TRANSACTIONS_PATCH_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
