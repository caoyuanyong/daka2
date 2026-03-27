export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { type, data } = await request.json();

    if (type === 'WISH') {
      const res = await prisma.wish.update({ where: { id }, data });
      return NextResponse.json(res);
    } else if (type === 'MEDAL') {
      const res = await prisma.medal.update({ where: { id }, data });
      return NextResponse.json(res);
    }
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { type } = await request.json();
    if (type === 'WISH') {
      await prisma.wish.delete({ where: { id } });
    } else if (type === 'MEDAL') {
      await prisma.medal.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
