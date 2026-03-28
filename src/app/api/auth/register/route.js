export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码长度至少为 6 位'),
  name: z.string().min(1, '显示名称不能为空'),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Zod Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.issues?.[0]?.message || '参数校验失败' 
      }, { status: 400 });
    }

    const { username, password, name } = validation.data;

    const existingFamily = await prisma.family.findUnique({
      where: { username }
    });

    if (existingFamily) {
      return NextResponse.json({ error: '该用户名已被占用' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const family = await prisma.family.create({
      data: {
        username,
        password: hashedPassword,
        members: {
          create: [
            { name: name || '管理员', role: 'primary' }
          ]
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ 
      id: family.id, 
      username: family.username,
      members: family.members
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
  }
}
