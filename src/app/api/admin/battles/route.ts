import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;
  if (!decoded || decoded.userType !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const minFee = searchParams.get('minFee') ? parseFloat(searchParams.get('minFee')!) : undefined;
    const maxFee = searchParams.get('maxFee') ? parseFloat(searchParams.get('maxFee')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: Prisma.BattleWhereInput = {};

    if (search) {
      where.OR = [
        { battleId: { contains: search } },
        { roomCode: { contains: search } },
        { creator: { name: { contains: search } } },
        { creator: { phone: { contains: search } } },
        { opponent: { name: { contains: search } } },
        { opponent: { phone: { contains: search } } },
      ];
    }

    if (status) where.status = status as any;
    if (minFee !== undefined || maxFee !== undefined) {
      where.entryFee = {
        gte: minFee,
        lte: maxFee,
      };
    }

    const skip = (page - 1) * limit;

    const [battles, total] = await Promise.all([
      prisma.battle.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, phone: true } },
          opponent: { select: { id: true, name: true, phone: true } },
          winner: { select: { id: true, name: true } },
          proofSubmittedBy: { select: { id: true, name: true } },
          decidedBy: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.battle.count({ where }),
    ]);

    return NextResponse.json({
      battles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('ADMIN_BATTLES_GET_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}