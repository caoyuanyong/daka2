import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().nullable().optional(),
  points: z.number().int().optional(),
  checkInDays: z.number().int().optional(),
  role: z.string().optional(),
  unlockedPets: z.union([z.string(), z.array(z.string())]).nullable().optional(),
});

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Zod Validation
    const validation = updateMemberSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || '参数校验失败';
      return NextResponse.json({ 
        error: firstError 
      }, { status: 400 });
    }

    const data = validation.data;

    // 2. Filter out non-existent fields for User model
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.checkInDays !== undefined) updateData.checkInDays = data.checkInDays;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.unlockedPets !== undefined) {
      if (data.unlockedPets === null) {
        updateData.unlockedPets = null;
      } else {
        updateData.unlockedPets = typeof data.unlockedPets === 'string' 
          ? data.unlockedPets 
          : JSON.stringify(data.unlockedPets);
      }
    }

    console.log('Final updateData for Member:', updateData);

    const updatedMember = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update member error [Detailed]:', error);
    return NextResponse.json({ 
      error: '更新成员信息失败', 
      details: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: '删除成员失败' }, { status: 500 });
  }
}
