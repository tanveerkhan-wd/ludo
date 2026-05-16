import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const createSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  userType: z.enum(['Player', 'Admin']).default('Player'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone: result.data.phone });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone already exists' }, { status: 400 });
    }

    const newUser = await User.create(result.data);

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('ADMIN_USER_CREATE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
