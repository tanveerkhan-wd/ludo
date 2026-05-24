import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-jwt";

export async function GET(req: Request) {
  try {
    const admin = await getUserFromRequest(req);
    if (!admin || admin.userType !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where = status && status !== 'ALL' ? { kycStatus: status as any } : {};

    const kycs = await prisma.kYC.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        reviewedBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ kycs });
  } catch (error) {
    console.error("Admin KYC Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
