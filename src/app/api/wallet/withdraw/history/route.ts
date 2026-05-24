import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const history = await prisma.withdrawalRequest.findMany({
      where: { userId: decoded.id },
      orderBy: { requestedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
