export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const wishes = await prisma.wish.findMany({ where: { userId } });
    const medals = await prisma.medal.findMany({ where: { userId } });
    const history = await prisma.history.findMany({ 
      where: { userId }, 
      orderBy: { date: 'desc' },
      take: 50
    });

    return NextResponse.json({ wishes, medals, history });
  } catch (error) {
    console.error('Fetch rewards data error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Helper to handle multiple POSTs for batch migration or single create
export async function POST(request) {
  try {
    const { type, data, userId } = await request.json();
    if (!userId || !type || !data) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    if (type === 'WISH') {
      const res = await prisma.wish.create({ data: { ...data, userId } });
      return NextResponse.json(res);
    } else if (type === 'MEDAL') {
      const res = await prisma.medal.create({ data: { ...data, userId } });
      return NextResponse.json(res);
    } else if (type === 'HISTORY') {
      const res = await prisma.history.create({ data: { ...data, userId } });
      return NextResponse.json(res);
    }
    
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Create reward item error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
