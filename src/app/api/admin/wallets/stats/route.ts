import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { TransactionType } from '@prisma/client';

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUserBalance,
      totalDeposits,
      totalWithdrawals,
      todayDeposits,
      todayWithdrawals
    ] = await Promise.all([
      prisma.user.aggregate({ _sum: { walletBalance: true } }),
      prisma.user.aggregate({ _sum: { totalDeposited: true } }),
      prisma.user.aggregate({ _sum: { totalWithdrawn: true } }),
      prisma.walletTransaction.aggregate({
        where: { type: TransactionType.DEPOSIT, createdAt: { gte: today } },
        _sum: { amount: true }
      }),
      prisma.walletTransaction.aggregate({
        where: { type: TransactionType.WITHDRAWAL, createdAt: { gte: today } },
        _sum: { amount: true }
      })
    ]);

    return NextResponse.json({
      totalUserBalance: totalUserBalance._sum.walletBalance || 0,
      totalDeposits: totalDeposits._sum.totalDeposited || 0,
      totalWithdrawals: totalWithdrawals._sum.totalWithdrawn || 0,
      todayDeposits: todayDeposits._sum.amount || 0,
      todayWithdrawals: todayWithdrawals._sum.amount || 0,
    });
  } catch (error: any) {
    console.error('ADMIN_WALLET_STATS_API_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
