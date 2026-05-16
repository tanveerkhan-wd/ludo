import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { z } from 'zod';

const verifySchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { phone, otp } = result.data;

    const user = await User.findOne({ 
      phone, 
      otp, 
      otpExpiry: { $gt: new Date() } 
    }).select('+otp +otpExpiry');

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = await signToken({ id: user._id.toString(), userType: user.userType });

    const response = NextResponse.json({ 
      message: 'Logged in successfully',
      user: {
        _id: user._id,
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
