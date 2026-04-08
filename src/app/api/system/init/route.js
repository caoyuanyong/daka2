import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const [member, activePet, habits, records, plans] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          family: true
        }
      }),
      prisma.pet.findFirst({
        where: { userId, isActive: true }
      }),
      prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.habitRecord.findMany({
        where: { userId, date },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.learningPlan.findMany({
        where: { userId, date },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Handle BigInt serialization for Family model (vipExpiry)
    if (member?.family) {
      member.family.vipExpiry = member.family.vipExpiry.toString();
    }

    return NextResponse.json({
      member,
      activePet,
      habits: habits || [],
      records: records || [],
      plans: plans || [],
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('System init error:', error);
    return NextResponse.json({ error: '系统初始化失败' }, { status: 500 });
  }
}
