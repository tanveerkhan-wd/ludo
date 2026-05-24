import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { notificationService } from '@/lib/notification';
import { NotificationType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target, userIds, title, message, type, link } = await req.json();

    if (target === 'ALL') {
      await notificationService.notifyAll({
        title,
        message,
        type: type || NotificationType.ADMIN_ALERT,
        link,
      });
    } else if (target === 'SPECIFIC' && userIds && userIds.length > 0) {
      await notificationService.createMany({
        userIds,
        title,
        message,
        type: type || NotificationType.ADMIN_ALERT,
        link,
      });
    } else if (target === 'CONDITION') {
      // Example: Users with low balance
      const { condition } = await req.json();
      let where: any = {};
      
      if (condition === 'LOW_BALANCE') {
        where.walletBalance = { lt: 10 };
      } else if (condition === 'KYC_PENDING') {
        where.kyc = { kycStatus: 'PENDING' };
      }

      const users = await prisma.user.findMany({ where, select: { id: true } });
      const ids = users.map(u => u.id);
      
      if (ids.length > 0) {
        await notificationService.createMany({
          userIds: ids,
          title,
          message,
          type: type || NotificationType.ADMIN_ALERT,
          link,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ADMIN_SEND_NOTIFICATION_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
