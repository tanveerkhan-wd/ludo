import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { walletService } from '@/lib/wallet';

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

    const balance = await walletService.getWalletSummary(decoded.id);

    return NextResponse.json(balance);
  } catch (error: any) {
    console.error('WALLET_BALANCE_API_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
