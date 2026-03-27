export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const families = await prisma.family.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform BigInt to string and format
    const formatted = families.map(f => ({
      ...f,
      vipExpiry: f.vipExpiry.toString(),
      memberCount: f._count.members
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Admin Fetch families error:', error);
    return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, password, name } = await request.json();
    // Implementation for manual family creation if needed
    // ...
    return NextResponse.json({ message: 'Not implemented yet' });
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
