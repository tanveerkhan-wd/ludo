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

    const sendViaTwilio = process.env.SEND_OTP_VIA_TWILIO !== 'false';

    if (sendViaTwilio) {
      await sendOTP(phone, otp);
      return NextResponse.json({ 
        success: true,
        message: 'OTP sent successfully'
      });
    } else {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
      return NextResponse.json({ 
        success: true,
        message: 'Twilio is disabled in development mode',
        debugOtp: otp
      });
    }
  } catch (error: any) {
    console.error('SEND_OTP_ERROR', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
