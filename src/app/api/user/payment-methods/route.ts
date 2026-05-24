import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { UpdatePaymentMethodSchema } from '@/types/withdrawal';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        preferredWithdrawalMethod: true,
        upiId: true,
        bankAccountNumber: true,
        bankIfscCode: true,
        bankAccountHolderName: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = UpdatePaymentMethodSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { preferredWithdrawalMethod, upiId, bankAccountNumber, bankIfscCode, bankAccountHolderName } = validation.data;

    await prisma.user.update({
      where: { id: decoded.id },
      data: {
        preferredWithdrawalMethod,
        upiId,
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
      }
    });

    return NextResponse.json({ success: true, message: 'Payment methods updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
