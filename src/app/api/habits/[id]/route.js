export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updatedHabit = await prisma.habit.update({
      where: { id },
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
      }
    });
    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Update habit error:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.habit.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete habit error:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
