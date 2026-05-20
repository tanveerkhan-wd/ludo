import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { walletService } from '@/lib/wallet';
import { zapupiService } from '@/lib/zapupi';
import { TransactionType, TransactionStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { phone: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const amount = result.data.amount;
    const order_id = walletService.generateTransactionId('ZAP');

    // Fetch active gateway from settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global' },
    });

    const activeGateway = settings?.activePaymentGateway || 'NONE';

    if (activeGateway === 'NONE') {
      return NextResponse.json({ error: 'Online deposits are currently disabled. Please contact support for manual deposit.' }, { status: 400 });
    }

    if (activeGateway !== 'ZAPUPI') {
      return NextResponse.json({ error: `${activeGateway} integration is coming soon. Please use ZapUPI or manual deposit.` }, { status: 501 });
    }

    // 1. Create a PENDING transaction record
    const transaction = await walletService.creditUser({
      userId: decoded.id,
      amount: amount,
      type: TransactionType.DEPOSIT,
      description: `Deposit of ₹${amount} via ${activeGateway}`,
      status: TransactionStatus.PENDING,
      metadata: { gateway: activeGateway }
    });

    try {
      // 2. Initiate payment with ZapUPI (Only if activeGateway is ZAPUPI)
      if (activeGateway === 'ZAPUPI') {
        // Use key from settings if available, otherwise fallback to env
        const zapKey = settings?.zapupiKey || process.env.ZAPUPI_KEY;
        
        if (!zapKey) {
          throw new Error('ZapUPI API Key is not configured in settings');
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // Temporarily override zapupiService to use the key from settings
        // In a real app, you might pass the key to the service method
        const zapResponse = await zapupiService.createOrder({
          order_id: transaction.transactionId,
          amount: amount,
          customer_mobile: user.phone,
          remark: `Deposit for ${user.phone}`,
          success_url: `${appUrl}/dashboard/wallet?status=success&txn=${transaction.transactionId}`,
          failed_url: `${appUrl}/dashboard/wallet?status=failed&txn=${transaction.transactionId}`,
          timeout_url: `${appUrl}/dashboard/wallet?status=timeout&txn=${transaction.transactionId}`,
        }, zapKey);

        if (zapResponse.status === 'success') {
          return NextResponse.json({ 
            success: true, 
            payment_url: zapResponse.payment_url,
            transactionId: transaction.transactionId
          });
        } else {
          // Mark transaction as FAILED if gateway rejected it
          await prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: { 
              status: TransactionStatus.FAILED,
              description: `Deposit Failed: ${zapResponse.message}`
            }
          });
          return NextResponse.json({ error: zapResponse.message || 'Payment gateway error' }, { status: 400 });
        }
      }
    } catch (gatewayError: any) {
      console.error('ZAPUPI_GATEWAY_ERROR', gatewayError);
      // Mark as FAILED on technical error
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { 
          status: TransactionStatus.FAILED,
          description: 'Payment gateway connection failed'
        }
      });
      return NextResponse.json({ error: 'Could not connect to payment gateway' }, { status: 502 });
    }
  } catch (error: any) {
    console.error('WALLET_DEPOSIT_API_ERROR', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
