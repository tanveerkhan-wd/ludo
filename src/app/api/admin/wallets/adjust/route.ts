import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-jwt';
import prisma from '@/lib/prisma';
import { walletService } from '@/lib/wallet';
import { TransactionType } from '@prisma/client';
import { z } from 'zod';

const adjustSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['ADMIN_CREDIT', 'ADMIN_DEBIT']),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!admin || admin.userType !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = adjustSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { userId, amount, type, reason } = result.data;

    let transaction;
    if (type === 'ADMIN_CREDIT') {
      transaction = await walletService.creditUser({
        userId,
        amount,
        type: TransactionType.ADMIN_CREDIT,
        description: `Admin Credit: ${reason}`,
        adminId: admin.id
      });
    } else {
      transaction = await walletService.debitUser({
        userId,
        amount,
        type: TransactionType.ADMIN_DEBIT,
        description: `Admin Debit: ${reason}`,
        adminId: admin.id
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('ADMIN_ADJUST_WALLET_API_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
