import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (transactionId) where.transactionId = { contains: transactionId };
    if (phone) {
      where.user = { phone: { contains: phone } };
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
