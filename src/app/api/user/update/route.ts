import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-jwt';
import { z } from 'zod';
import { notificationService } from '@/lib/notification';
import { NotificationType } from '@prisma/client';

const UpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  upiId: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfscCode: z.string().optional().nullable(),
  bankAccountHolderName: z.string().optional().nullable(),
  preferredWithdrawalMethod: z.enum(['UPI', 'BANK']).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = UpdateUserSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, upiId, bankAccountNumber, bankIfscCode, bankAccountHolderName, preferredWithdrawalMethod } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name,
        upiId,
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
        preferredWithdrawalMethod,
      }
    });

    await notificationService.create({
      userId: decoded.id,
      title: "Profile Updated Successfully ✅",
      message: "Your profile information and withdrawal settings have been updated.",
      type: NotificationType.PROFILE_UPDATE,
      link: "/profile"
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Information updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        upiId: updatedUser.upiId,
        bankAccountNumber: updatedUser.bankAccountNumber,
        bankIfscCode: updatedUser.bankIfscCode,
        bankAccountHolderName: updatedUser.bankAccountHolderName,
        preferredWithdrawalMethod: updatedUser.preferredWithdrawalMethod,
      }
    });
  } catch (error) {
    console.error('UPDATE_USER_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
