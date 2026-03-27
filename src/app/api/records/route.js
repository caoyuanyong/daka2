export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date'); // Optional date filter
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where = { userId };
    if (date) {
      where.date = date;
    }

    const records = await prisma.habitRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        habit: true
      }
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('Fetch records error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.userId || !data.habitId) {
      return NextResponse.json({ error: 'userId and habitId are required' }, { status: 400 });
    }

    const newRecord = await prisma.habitRecord.create({
      data: {
        habitId: data.habitId,
        date: data.date,
        pointsChange: data.pointsChange,
        userId: data.userId,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      }
    });
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error('Create record error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
