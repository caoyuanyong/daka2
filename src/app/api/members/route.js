export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const memberSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  avatar: z.string().optional(),
  role: z.enum(['primary', 'secondary']).optional(),
  points: z.number().int().optional(),
  checkInDays: z.number().int().optional(),
  familyId: z.string().min(1, 'familyId 不能为空'),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json({ error: '缺少 familyId' }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: { familyId },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: '获取成员列表失败' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Zod Validation
    const validation = memberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors[0].message 
      }, { status: 400 });
    }

    const data = validation.data;

    const newMember = await prisma.user.create({
      data: {
        name: data.name,
        avatar: data.avatar,
        role: data.role || 'secondary',
        points: data.points || 0,
        checkInDays: data.checkInDays || 0,
        familyId: data.familyId
      }
    });
    return NextResponse.json(newMember);
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: '创建成员失败' }, { status: 500 });
  }
}
