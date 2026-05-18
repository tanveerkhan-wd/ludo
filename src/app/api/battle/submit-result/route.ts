import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { SubmitResultSchema } from '@/types/battle';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const validation = SubmitResultSchema.safeParse(body);
  if (!validation.success) return NextResponse.json(validation.error, { status: 400 });

  const { battleId, result, screenshotUrl } = validation.data;

  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle || ![battle.creatorId, battle.opponentId].includes(session.user.id))
    return NextResponse.json({ error: 'Invalid battle' }, { status: 403 });

  // Simple logic for result submission
  await prisma.battle.update({
    where: { id: battleId },
    data: {
      result: result === 'WIN' ? 'WIN' : 'LOSS',
      resultPostedById: session.user.id,
      screenshotUrl,
      resultSubmittedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
