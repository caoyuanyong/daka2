export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        family: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const stats = {
      total: coupons.length,
      used: coupons.filter(c => c.used).length,
      unused: coupons.filter(c => !c.used).length
    };

    return NextResponse.json({ coupons, stats });
  } catch (error) {
    console.error('Admin Fetch coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
