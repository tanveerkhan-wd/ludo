import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { z } from 'zod';

const AdminCreateBattleSchema = z.object({
  entryFee: z.number().positive(),
  roomCode: z.string().min(4).max(10),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded || decoded.userType !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const validation = AdminCreateBattleSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { entryFee, roomCode } = validation.data;

  try {
    const battle = await prisma.battle.create({
      data: {
        battleId: `ADMIN-BTL-${Date.now()}`,
        creatorId: decoded.id,
        entryFee,
        prizeAmount: entryFee * 1.8,
        platformFee: entryFee * 0.2,
        roomCode,
        status: 'OPEN',
      },
    });

    return NextResponse.json(battle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}