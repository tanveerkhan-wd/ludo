import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateBattleSchema } from '@/types/battle';
import { getServerSession } from 'next-auth'; // Assuming next-auth integration exists

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const validation = CreateBattleSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { entryFee, roomCode } = validation.data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Check & Lock Funds
      const user = await tx.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
      if (!user || user.walletBalance.lt(entryFee)) throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: entryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          amount: entryFee,
          type: 'DEBIT',
          description: 'Battle Entry Fee',
        },
      });

      // 2. Create Battle
      const battle = await tx.battle.create({
        data: {
          battleId: `BTL-${Date.now()}`,
          creatorId: session.user.id,
          entryFee,
          prizeAmount: entryFee * 1.8, // 10% platform fee
          platformFee: entryFee * 0.2,
          roomCode,
        },
      });

      return NextResponse.json(battle);
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
