import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { processReferralCommission, creditReferralCommission } from '@/lib/referral';

export async function POST(req: NextRequest, { params }: { params: Promise<{ battleId: string }> }) {
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { battleId } = await params;
  const userId = decoded.id;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Find Battle
      const battle = await tx.battle.findUnique({ 
        where: { id: battleId },
        include: { creator: true }
      });
      
      if (!battle || battle.status !== 'OPEN' || battle.creatorId === userId)
        throw new Error('Battle unavailable');

      // 2. Lock Entry Fee for Opponent
      const user = await tx.user.findUnique({ 
        where: { id: userId }, 
        select: { walletBalance: true } 
      });
      
      if (!user || user.walletBalance.lt(battle.entryFee)) 
        throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: battle.entryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: userId,
          battleId: battle.id,
          amount: battle.entryFee,
          type: 'DEBIT',
          description: 'Battle Entry Fee',
        },
      });

      // 3. Update Battle to IN_PROGRESS
      const updated = await tx.battle.update({
        where: { id: battleId },
        data: {
          opponentId: userId,
          status: 'IN_PROGRESS',
        },
      });

      // 4. Handle Referral Commissions (Lifetime 3%)
      // Process for Creator
      const creatorReferral = await processReferralCommission(battle.id, battle.creatorId, tx);
      if (creatorReferral) {
        await creditReferralCommission(creatorReferral.referrerId, creatorReferral.amount, battle.id, tx);
      }

      // Process for Opponent
      const opponentReferral = await processReferralCommission(battle.id, userId, tx);
      if (opponentReferral) {
        await creditReferralCommission(opponentReferral.referrerId, opponentReferral.amount, battle.id, tx);
      }

      return NextResponse.json(updated);
    });
  } catch (error: any) {
    console.error('JOIN_BATTLE_REFERRAL_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
