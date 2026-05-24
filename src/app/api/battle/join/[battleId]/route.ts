import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { processReferralCommission, creditReferralCommission } from '@/lib/referral';
import { walletService } from '@/lib/wallet';
import { TransactionType, NotificationType } from '@prisma/client';
import { notificationService } from '@/lib/notification';

export async function POST(req: NextRequest, { params }: { params: Promise<{ battleId: string }> }) {
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { battleId } = await params;
  const userId = decoded.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find Battle
      const battle = await tx.battle.findUnique({ 
        where: { id: battleId },
        include: { creator: { select: { id: true, status: true, name: true } } }
      });
      
      if (!battle || battle.status !== 'OPEN' || battle.creatorId === userId)
        throw new Error('Battle unavailable');

      // 2. Check Opponent Balance
      const user = await tx.user.findUnique({ 
        where: { id: userId }, 
        select: { walletBalance: true, name: true } 
      });
      
      if (!user) throw new Error('User not found');
      if (Number(user.walletBalance) < Number(battle.entryFee)) 
        throw new Error('Insufficient balance');

      // 3. Update Battle to IN_PROGRESS (Immediate Lock)
      const updated = await tx.battle.update({
        where: { id: battleId },
        data: {
          opponentId: userId,
          status: 'IN_PROGRESS',
        },
      });

      // 4. Deduct Entry Fee
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: battle.entryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          transactionId: walletService.generateTransactionId('BTL'),
          userId: userId,
          battleId: battle.id,
          amount: battle.entryFee,
          type: TransactionType.BATTLE_JOIN,
          description: `Battle Entry Fee for ${battle.battleId}`,
        },
      });

      // Notify Creator
      await notificationService.create({
        userId: battle.creatorId,
        title: "Battle Started! ⚔️",
        message: `${user.name} joined your battle. Start playing now!`,
        type: NotificationType.BATTLE_RESULT,
        link: `/battles`
      });

      return updated;
    }, {
      timeout: 10000 // Increase timeout to 10 seconds for concurrent safety
    });

    // 5. Handle Referral Commissions (Non-blocking / Background)
    // We do this AFTER the main transaction to keep it fast
    try {
      // Process for Creator
      const creatorReferral = await processReferralCommission(result.id, result.creatorId);
      if (creatorReferral) {
        await prisma.$transaction(async (tx) => {
          await creditReferralCommission(creatorReferral.referrerId, creatorReferral.amount, result.id, tx);
        });
      }

      // Process for Opponent
      const opponentReferral = await processReferralCommission(result.id, userId);
      if (opponentReferral) {
        await prisma.$transaction(async (tx) => {
          await creditReferralCommission(opponentReferral.referrerId, opponentReferral.amount, result.id, tx);
        });
      }
    } catch (refErr) {
      console.error('REFERRAL_PROCESSING_DELAYED_ERROR', refErr);
      // Don't fail the join if referral fails
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('JOIN_BATTLE_REFERRAL_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
