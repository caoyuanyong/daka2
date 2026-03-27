export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Only for demonstration/dev use. In production, this would be restricted.
export async function POST(request) {
  try {
    const { count = 5, days = 31 } = await request.json();
    
    const coupons = [];
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    for (let i = 0; i < count; i++) {
        let code = '';
        for (let j = 0; j < 16; j++) {
            if (j > 0 && j % 4 === 0) code += '-';
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        coupons.push({ code, days });
    }

    const result = await prisma.coupon.createMany({
      data: coupons
    });

    return NextResponse.json({ 
      count: result.count,
      coupons
    });
  } catch (error) {
    console.error('Generate coupons error:', error);
    return NextResponse.json({ error: 'Failed to generate coupons' }, { status: 500 });
  }
}
