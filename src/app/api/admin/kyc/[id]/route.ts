import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-jwt";
import { z } from "zod";

const updateSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getUserFromRequest(req);
    if (!admin || admin.userType !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();
    const { action, rejectionReason } = updateSchema.parse(body);

    if (action === "REJECT" && (!rejectionReason || rejectionReason.trim().length === 0)) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!kyc) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 });
    }

    const updatedKyc = await prisma.$transaction(async (tx) => {
      const updated = await tx.kYC.update({
        where: { id },
        data: {
          kycStatus: action === "APPROVE" ? "VERIFIED" : "REJECTED",
          verifiedAt: action === "APPROVE" ? new Date() : null,
          rejectionReason: action === "REJECT" ? rejectionReason : null,
          reviewedById: admin.id,
        },
      });

      // Update user details if approved to avoid redundant DB queries during normal ops
      // Only keep relation sync
      
      return updated;
    });

    return NextResponse.json({ message: `KYC ${action === "APPROVE" ? "Verified" : "Rejected"} successfully`, kyc: updatedKyc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    console.error("Admin KYC Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
