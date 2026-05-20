import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateBattleSchema } from '@/types/battle';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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
      // 1. Check & Lock Funds
      const user = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
      if (!user) throw new Error('User not found');
      
      // Convert Decimal/Number to float for comparison if needed, 
      // but Prisma handles comparisons if they are same type.
      // Based on schema, walletBalance is likely Decimal or Int.
      if (Number(user.walletBalance) < entryFee) throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: entryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: userId,
          amount: entryFee,
          type: 'DEBIT',
          description: 'Battle Entry Fee',
        },
      });

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

      return NextResponse.json(battle);
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
