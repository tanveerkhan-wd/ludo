import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SubmitResultSchema } from '@/types/battle';
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
  const validation = SubmitResultSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { battleId, result, screenshotUrl } = validation.data;

  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle || ![battle.creatorId, battle.opponentId].includes(userId))
    return NextResponse.json({ error: 'Invalid battle' }, { status: 403 });

  // Simple logic for result submission
  await prisma.battle.update({
    where: { id: battleId },
    data: {
      result: result === 'WIN' ? 'WIN' : 'LOSS',
      resultPostedById: userId,
      screenshotUrl,
      resultSubmittedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
