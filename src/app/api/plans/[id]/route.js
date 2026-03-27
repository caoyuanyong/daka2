export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updatedPlan = await prisma.learningPlan.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date,
        timeType: data.timeType,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        completed: data.completed,
        category: data.category,
        reward: data.reward,
        repeatType: data.repeatType,
        ebbinghausMode: data.ebbinghausMode,
      }
    });
    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.learningPlan.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
