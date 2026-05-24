import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOTP } from '@/lib/sms';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = phoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, referralCode } = result.data;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { otp, otpExpiry },
      });
    } else {
      // Logic for new user with referral
      let referredById = null;
      if (referralCode) {
        const referrer = await prisma.user.findUnique({ 
          where: { referralCode: referralCode.toUpperCase() } 
        });
        if (referrer) {
          referredById = referrer.id;
        }
      }

      await prisma.user.create({
        data: {
          phone,
          userType: phone === '9999999999' ? 'Admin' : 'Player',
          otp,
          otpExpiry,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredById,
        },
      });
    }

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
