import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request, { params }: { params: { battleId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { battleId } = params;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Find Battle
      const battle = await tx.battle.findUnique({ where: { id: battleId } });
      if (!battle || battle.status !== 'OPEN' || battle.creatorId === session.user.id)
        throw new Error('Battle unavailable');

      // 2. Lock Entry Fee
      const user = await tx.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
      if (!user || user.walletBalance.lt(battle.entryFee)) throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: battle.entryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          battleId: battle.id,
          amount: battle.entryFee,
          type: 'DEBIT',
          description: 'Battle Entry Fee',
        },
      });

      // 3. Update Battle
      const updated = await tx.battle.update({
        where: { id: battleId },
        data: {
          opponentId: session.user.id,
          status: 'IN_PROGRESS',
        },
      });

      return NextResponse.json(updated);
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
