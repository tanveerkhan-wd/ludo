import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth-jwt';
import { z } from 'zod';
import { notificationService } from '@/lib/notification';
import { NotificationType } from '@prisma/client';

const verifySchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, otp } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        phone,
        otp,
        otpExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const isNewUser = user.lastLoginAt === null;

    // Clear OTP after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiry: null,
        lastLoginAt: new Date(),
      },
    });

    if (isNewUser) {
      await notificationService.create({
        userId: user.id,
        title: "Welcome to Bajiger Ludo! 🎮",
        message: "Get ready to play, compete and earn. Start by adding cash to your wallet!",
        type: NotificationType.WELCOME,
        link: "/wallet"
      });

      if (user.referredById) {
        await notificationService.create({
          userId: user.referredById,
          title: "New Referral Registered! 🤝",
          message: `Your friend (${user.phone.substring(0, 6)}****) has joined. You'll earn 3% commission on their games!`,
          type: NotificationType.REFERRAL,
          link: "/dashboard/referral"
        });
      }
    }

    const token = await signToken({ id: user.id, userType: user.userType });

    const response = NextResponse.json({ 
      message: 'Logged in successfully',
      user: {
        _id: user.id, // Keeping _id for frontend compatibility
        id: user.id,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
        walletBalance: user.walletBalance
      }
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('VERIFY_OTP_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
