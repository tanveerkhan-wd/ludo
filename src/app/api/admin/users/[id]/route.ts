import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  userType: z.enum(['Player', 'Admin']).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Banned']).optional(),
  kycStatus: z.enum(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED']).optional(),
  walletBalance: z.number().optional(),
  referralCode: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        kyc: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('ADMIN_USER_GET_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { kycStatus, ...userData } = result.data;

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: userData,
      });

      if (kycStatus) {
        await tx.kYC.upsert({
          where: { userId: id },
          update: { kycStatus },
          create: { userId: id, kycStatus },
        });
      }

      return updatedUser;
    });

    return NextResponse.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    console.error('ADMIN_USER_PUT_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      const user = await prisma.user.delete({
        where: { id },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User permanently deleted' });
    } else {
      const user = await prisma.user.update({
        where: { id },
        data: { 
          accountDeleted: true,
          deletedAt: new Date(),
          status: 'Inactive'
        },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User soft deleted' });
    }
  } catch (error: any) {
    console.error('ADMIN_USER_DELETE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
