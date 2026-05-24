import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: 'global' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('SETTINGS_GET_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      create: { id: 'global', ...body },
      update: body,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('SETTINGS_POST_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
