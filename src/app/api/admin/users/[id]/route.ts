import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  userType: z.enum(['Player', 'Admin']).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Banned']).optional(),
  kycStatus: z.enum(['Pending', 'Submitted', 'Verified', 'Rejected']).optional(),
  walletBalance: z.number().optional(),
  referralCode: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const user = await User.findById(id).lean();
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
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
    await dbConnect();
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User permanently deleted' });
    } else {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          $set: { 
            accountDeleted: true,
            deletedAt: new Date(),
            status: 'Inactive'
          } 
        },
        { new: true }
      );
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
