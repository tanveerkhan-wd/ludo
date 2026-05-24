import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;

    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalPaid = await prisma.referralEarning.aggregate({
      _sum: { amount: true }
    });

    const topReferrers = await prisma.user.findMany({
      where: { totalReferralEarnings: { gt: 0 } },
      select: {
        id: true,
        name: true,
        phone: true,
        totalReferralEarnings: true,
        _count: {
          select: { referrals: true }
        }
      },
      orderBy: { totalReferralEarnings: 'desc' },
      take: 10
    });

    const totalUsers = await prisma.user.count();
    const referredUsers = await prisma.user.count({
      where: { referredById: { not: null } }
    });

    return NextResponse.json({
      totalPaid: totalPaid._sum.amount || 0,
      topReferrers,
      conversionRate: totalUsers > 0 ? (referredUsers / totalUsers) * 100 : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
