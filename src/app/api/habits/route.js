export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const habitSchema = z.object({
  userId: z.string().min(1, 'userId 不能为空'),
  title: z.string().min(1, '习惯名称不能为空'),
  icon: z.string().optional(),
  color: z.string().optional(),
  points: z.number().int().default(10),
  type: z.enum(['daily', 'daily_multiple']).default('daily'),
  maxTimes: z.number().int().min(1).default(1),
  category: z.string().optional(),
  duration: z.number().int().optional(),
  desc: z.string().optional(),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Fetch habits error:', error);
    return NextResponse.json({ error: '获取习惯列表失败' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = habitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const data = validation.data;

    const newHabit = await prisma.habit.create({
      data: {
        title: data.title,
        icon: data.icon,
        color: data.color,
        points: data.points,
        type: data.type,
        maxTimes: data.maxTimes,
        category: data.category,
        duration: data.duration,
        desc: data.desc,
        userId: data.userId
      }
    });
    return NextResponse.json(newHabit);
  } catch (error) {
    console.error('Create habit error:', error);
    return NextResponse.json({ error: '创建习惯失败' }, { status: 500 });
  }
}
