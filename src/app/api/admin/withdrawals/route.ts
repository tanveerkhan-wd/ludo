import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { withdrawalId: { contains: search } },
        { user: { phone: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        include: {
          user: {
            select: { name: true, phone: true }
          }
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawalRequest.count({ where })
    ]);

    return NextResponse.json({
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
