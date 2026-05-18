import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    const earnings = await prisma.referralEarning.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: { name: true, phone: true }
        },
        battle: {
          select: { battleId: true, entryFee: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(earnings);
  } catch (error) {
    console.error('REFERRAL_HISTORY_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
