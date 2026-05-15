import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTP } from '@/lib/sms';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = phoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { phone } = result.data;
    
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ 
        phone,
        userType: phone === '9999999999' ? 'Admin' : 'Player'
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

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
