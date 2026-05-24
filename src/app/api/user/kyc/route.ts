import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-jwt";
import { kycSchema } from "@/lib/validations/kyc";
import { ZodError } from "zod";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ kyc });
  } catch (error) {
    console.error("KYC Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = kycSchema.parse(body);

    const existingKyc = await prisma.kYC.findUnique({
      where: { userId: user.id },
    });

    if (existingKyc && (existingKyc.kycStatus === 'VERIFIED' || existingKyc.kycStatus === 'SUBMITTED')) {
      return NextResponse.json({ error: "KYC already submitted or verified." }, { status: 400 });
    }

    const updatedKyc = await prisma.$transaction(async (tx) => {
      const kyc = await tx.kYC.upsert({
        where: { userId: user.id },
        update: {
          ...validatedData,
          kycStatus: "SUBMITTED",
          submittedAt: new Date(),
          rejectionReason: null,
        },
        create: {
          userId: user.id,
          ...validatedData,
          kycStatus: "SUBMITTED",
          submittedAt: new Date(),
        },
      });
      return kyc;
    });

    return NextResponse.json({ kyc: updatedKyc, message: "KYC Submitted Successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    console.error("KYC Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
