import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        totalReferralEarnings: true,
        _count: {
          select: { referrals: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      referralCode: user.referralCode,
      totalEarnings: user.totalReferralEarnings,
      totalReferred: user._count.referrals,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?ref=${user.referralCode}`
    });
  } catch (error) {
    console.error('REFERRAL_STATS_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
