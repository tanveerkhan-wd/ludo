import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { walletService } from '@/lib/wallet';
import { TransactionType } from '@prisma/client';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().min(10, 'Minimum deposit is ₹10'),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const body = await req.json();
    const result = depositSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    // SIMULATION: In a real app, this would initiate a payment gateway (Razorpay/UPI)
    // For now, we simulate a successful deposit for testing purposes
    const transaction = await walletService.creditUser({
      userId: decoded.id,
      amount: result.data.amount,
      type: TransactionType.DEPOSIT,
      description: `Deposit of ₹${result.data.amount} (Simulated)`,
      metadata: { gateway: 'Simulation', timestamp: new Date().toISOString() }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit successful (Simulated)',
      transaction 
    });
  } catch (error: any) {
    console.error('WALLET_DEPOSIT_API_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
