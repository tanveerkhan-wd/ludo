import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateBattleSchema } from '@/types/battle';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-jwt';
import { walletService } from '@/lib/wallet';
import { TransactionType } from '@prisma/client';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = decoded.id;

  const body = await req.json();
  const validation = CreateBattleSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { entryFee, roomCode } = validation.data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Check User & Balance
      const user = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
      if (!user) throw new Error('User not found');
      
      if (Number(user.walletBalance) < entryFee) throw new Error('Insufficient balance');

      // 2. Create Battle
      const battle = await tx.battle.create({
        data: {
          battleId: `BTL-${Date.now()}`,
          creatorId: userId,
          entryFee,
          prizeAmount: entryFee * 1.8, // 10% platform fee
          platformFee: entryFee * 0.2,
          roomCode,
        },
      });

      // 3. Debit Wallet using centralized walletService logic (within same transaction if possible)
      // Note: walletService methods start their own transactions, so we'll call create manually
      // or refactor walletService to accept a transaction client.
      // For now, consistent with schema requirement:
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: entryFee } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          transactionId: walletService.generateTransactionId('BTL'),
          userId: userId,
          battleId: battle.id,
          amount: entryFee,
          type: TransactionType.BATTLE_JOIN,
          description: `Battle Entry Fee for ${battle.battleId}`,
        },
      });

      return NextResponse.json(battle);
    });
  } catch (error: any) {
    console.error('BATTLE_CREATE_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
