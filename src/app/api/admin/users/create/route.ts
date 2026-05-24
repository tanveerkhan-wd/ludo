import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  userType: z.enum(['Player', 'Admin']).default('Player'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone: result.data.phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone already exists' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        ...result.data,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      }
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('ADMIN_USER_CREATE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
