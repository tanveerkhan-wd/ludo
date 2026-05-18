import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const AdminCreateBattleSchema = z.object({
  entryFee: z.number().positive(),
  roomCode: z.string().min(4).max(10),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  // Role check would go here: if (session?.user?.userType !== 'Admin') ...

  const body = await req.json();
  const validation = AdminCreateBattleSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { entryFee, roomCode } = validation.data;

  try {
    const battle = await prisma.battle.create({
      data: {
        battleId: `ADMIN-BTL-${Date.now()}`,
        creatorId: session!.user!.id, // Admin creator
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
