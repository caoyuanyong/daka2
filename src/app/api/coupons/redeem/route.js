export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code, familyId } = await request.json();

    if (!code || !familyId) {
      return NextResponse.json({ error: 'Code and familyId are required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (!coupon || coupon.used) {
      return NextResponse.json({ error: 'Invalid or used coupon' }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    const now = BigInt(Date.now());
    const currentExpiry = family.vipExpiry > 0n ? family.vipExpiry : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const daysInMs = BigInt(coupon.days) * 24n * 60n * 60n * 1000n;
    const newExpiry = baseDate + daysInMs;

    const [updatedFamily] = await prisma.$transaction([
      prisma.family.update({
        where: { id: familyId },
        data: {
          isVip: true,
          vipExpiry: newExpiry
        }
      }),
      prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          used: true,
          usedByFamilyId: familyId,
          usedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      vipExpiry: updatedFamily.vipExpiry.toString(),
      message: `Redeemed! VIP extended by ${coupon.days} days.`
    });
  } catch (error) {
    console.error('Redeem coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
