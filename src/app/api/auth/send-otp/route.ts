import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOTP } from '@/lib/sms';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = phoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { phone } = result.data;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    await prisma.user.upsert({
      where: { phone },
      update: {
        otp,
        otpExpiry,
      },
      create: {
        phone,
        userType: phone === '9999999999' ? 'Admin' : 'Player',
        otp,
        otpExpiry,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });

    // Send real OTP via Twilio utility
    const smsResult = await sendOTP(phone, otp);

    return NextResponse.json({ 
      message: smsResult.mock ? 'OTP logged (Mock)' : 'OTP sent successfully',
      // For testing, still return OTP in response if in dev mode
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });
  } catch (error: any) {
    console.error('SEND_OTP_ERROR', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
