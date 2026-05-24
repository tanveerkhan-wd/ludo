import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'ALL';
    const search = searchParams.get('search') || '';

    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    const userId = decoded?.id;

    let where: any = {};

    if (filter === 'OPEN') {
      where.status = 'OPEN';
    } else if (filter === 'MY BATTLES' && userId) {
      where.OR = [
        { creatorId: userId },
        { opponentId: userId }
      ];
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { battleId: { contains: search } },
        { creator: { name: { contains: search } } }
      ];
    }

    const battles = await prisma.battle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, avatar: true } },
        opponent: { select: { name: true, avatar: true } },
      }
    });

    // Serialize Decimal and Date for the frontend
    const serializedBattles = battles.map(b => ({
      ...b,
      entryFee: b.entryFee.toString(),
      prizeAmount: b.prizeAmount.toString(),
      platformFee: b.platformFee.toString(),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedBattles);
  } catch (error: any) {
    console.error('FETCH_BATTLES_ERROR', error);
    return NextResponse.json({ error: 'Failed to fetch battles' }, { status: 500 });
  }
}
