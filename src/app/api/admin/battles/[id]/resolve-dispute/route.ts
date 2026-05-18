import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { ResolveDisputeSchema } from '@/types/battle';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded || decoded.userType !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = ResolveDisputeSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { winnerId, adminNotes, status = 'COMPLETED' } = validation.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const battle = await tx.battle.findUnique({ 
        where: { id },
        include: {
          creator: true,
          opponent: true,
        }
      });
      
      if (!battle) throw new Error('Battle not found');
      if (battle.status !== 'DISPUTED' && battle.status !== 'IN_PROGRESS' && battle.status !== 'FULL') {
        // Allow resolving if it's stuck in other states too, but mainly DISPUTED
      }

      if (status === 'CANCELLED') {
        // Refund both players
        await tx.user.update({
          where: { id: battle.creatorId },
          data: { walletBalance: { increment: battle.entryFee } },
        });

        await tx.walletTransaction.create({
          data: {
            userId: battle.creatorId,
            battleId: battle.id,
            amount: battle.entryFee,
            type: 'REFUND',
            description: `Battle #${battle.battleId} Cancelled (Admin Resolved)`,
          },
        });

        if (battle.opponentId) {
          await tx.user.update({
            where: { id: battle.opponentId },
            data: { walletBalance: { increment: battle.entryFee } },
          });

          await tx.walletTransaction.create({
            data: {
              userId: battle.opponentId,
              battleId: battle.id,
              amount: battle.entryFee,
              type: 'REFUND',
              description: `Battle #${battle.battleId} Cancelled (Admin Resolved)`,
            },
          });
        }

        await tx.battle.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            adminNotes,
            decidedById: decoded.id,
          },
        });
      } else {
        // Mark as COMPLETED and pay winner
        if (!winnerId) throw new Error('Winner ID is required for COMPLETED status');

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
            description: `Battle #${battle.battleId} Win Payout (Admin Resolved)`,
          },
        });

        await tx.battle.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            winnerId,
            adminNotes,
            decidedById: decoded.id,
          },
        });
      }

      return NextResponse.json({ success: true });
    });
  } catch (error: any) {
    console.error('RESOLVE_DISPUTE_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
