import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Banned']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const result = statusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: result.data.status },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `User status updated to ${result.data.status}`, user });
  } catch (error: any) {
    console.error('ADMIN_USER_STATUS_PATCH_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
