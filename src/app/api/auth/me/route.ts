import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('ME_API_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
