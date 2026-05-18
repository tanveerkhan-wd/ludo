import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { ResolveDisputeSchema } from '@/types/battle';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  // Add role check logic here: if (session.user.role !== 'ADMIN') ...

  const { id } = params;
  const body = await req.json();
  const validation = ResolveDisputeSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { winnerId, adminNotes } = validation.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const battle = await tx.battle.findUnique({ where: { id } });
      if (!battle) throw new Error('Battle not found');

      // 1. Credit Winner
      await tx.user.update({
        where: { id: winnerId },
        data: { walletBalance: { increment: battle.prizeAmount } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: winnerId,
          battleId: battle.id,
          amount: battle.prizeAmount,
          type: 'CREDIT',
          description: 'Battle Win Payout (Admin Resolved)',
        },
      });

      // 2. Close Battle
      await tx.battle.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          winnerId,
          adminNotes,
          decidedById: session?.user?.id,
        },
      });

      return NextResponse.json({ success: true });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
