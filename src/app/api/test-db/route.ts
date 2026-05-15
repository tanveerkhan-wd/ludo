import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ status: 'Connected to MongoDB' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ status: 'Connection Failed', error: error.message }, { status: 500 });
  }
}
