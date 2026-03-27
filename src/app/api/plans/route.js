export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const planSchema = z.object({
  userId: z.string().min(1, 'userId 不能为空'),
  title: z.string().min(1, '计划名称不能为空'),
  date: z.string().min(1, '日期不能为空'),
  timeType: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  duration: z.union([z.string(), z.number()]).optional().nullable(),
  completed: z.boolean().default(false),
  category: z.string().optional().nullable(),
  reward: z.coerce.number().int().default(0),
  repeatType: z.string().optional().nullable(),
  ebbinghausMode: z.string().optional().nullable(),
});

const batchPlanSchema = z.array(planSchema);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const where = { userId };
    if (date) {
      where.date = date;
    }

    const plans = await prisma.learningPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Fetch plans error:', error);
    return NextResponse.json({ error: '获取计划列表失败' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Support both single plan and batch add
    if (Array.isArray(body)) {
      const validation = batchPlanSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
      }
      
      const data = validation.data;
      const newPlans = await prisma.learningPlan.createMany({
        data: data.map(plan => ({
          title: plan.title,
          date: plan.date,
          timeType: plan.timeType,
          startTime: plan.startTime,
          endTime: plan.endTime,
          duration: plan.duration ? Number(plan.duration) : null,
          completed: plan.completed,
          category: plan.category,
          reward: plan.reward,
          repeatType: plan.repeatType,
          ebbinghausMode: plan.ebbinghausMode,
          userId: plan.userId
        }))
      });
      return NextResponse.json({ count: newPlans.count });
    } else {
      const validation = planSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
      }

      const data = validation.data;
      const newPlan = await prisma.learningPlan.create({
        data: {
          title: data.title,
          date: data.date,
          timeType: data.timeType,
          startTime: data.startTime,
          endTime: data.endTime,
          duration: data.duration ? Number(data.duration) : null,
          completed: data.completed,
          category: data.category,
          reward: data.reward,
          repeatType: data.repeatType,
          ebbinghausMode: data.ebbinghausMode,
          userId: data.userId
        }
      });
      return NextResponse.json(newPlan);
    }
  } catch (error) {
    console.error('Create plan(s) error [Detailed]:', error);
    return NextResponse.json({ 
      error: '创建计划失败', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
