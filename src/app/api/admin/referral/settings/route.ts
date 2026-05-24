import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { getReferralSettings } from '@/lib/referral';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;

    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getReferralSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;

    if (!decoded || decoded.userType !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { referralEnabled, referralPercent, minEntryFee } = body;

    const updated = await prisma.systemSettings.update({
      where: { id: 'global' },
      data: {
        referralEnabled: referralEnabled !== undefined ? referralEnabled : undefined,
        referralPercent: referralPercent !== undefined ? referralPercent : undefined,
        minEntryFee: minEntryFee !== undefined ? minEntryFee : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
