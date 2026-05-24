import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-jwt';
import { walletService } from '@/lib/wallet';
import { TransactionType, TransactionStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as TransactionType | undefined;
    const status = searchParams.get('status') as TransactionStatus | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await walletService.getTransactionHistory({
      userId: decoded.id,
      type,
      status,
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WALLET_TRANSACTIONS_API_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
