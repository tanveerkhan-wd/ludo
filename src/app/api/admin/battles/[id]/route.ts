import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded || decoded.userType !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, phone: true } },
        opponent: { select: { id: true, name: true, phone: true } },
        winner: { select: { id: true, name: true } },
        proofSubmittedBy: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true } },
      },
    });

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    return NextResponse.json(battle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get('token')?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (!decoded || decoded.userType !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.battle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
