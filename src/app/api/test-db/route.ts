import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ status: 'Connected to SQLite via Prisma' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ status: 'Connection Failed', error: error.message }, { status: 500 });
  }
}
