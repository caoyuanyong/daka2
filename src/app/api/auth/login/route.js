import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码长度至少为 6 位'),
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is not defined in production environment');
}
const SAFE_JWT_SECRET = JWT_SECRET || 'bj-family-dev-secret-key';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Zod Validation
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors[0].message 
      }, { status: 400 });
    }

    const { username, password } = validation.data;

    const family = await prisma.family.findUnique({
      where: { username },
      include: { members: true }
    });

    if (!family) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, family.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const token = jwt.sign(
      { familyId: family.id, username: family.username },
      SAFE_JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      family: {
        id: family.id,
        username: family.username,
        isVip: family.isVip,
        vipExpiry: family.vipExpiry.toString()
      },
      members: family.members,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
}
