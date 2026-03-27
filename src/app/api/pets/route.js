import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const petSchema = z.object({
  userId: z.string().min(1, 'userId 不能为空'),
  name: z.string().min(1, '宠物名称不能为空'),
  typeId: z.string().min(1),
  level: z.number().int().default(1),
  intimacy: z.number().int().default(0),
  fullness: z.number().int().default(80),
  cleanliness: z.number().int().default(90),
  mood: z.number().int().default(85),
  isActive: z.boolean().default(false),
  unlockedPets: z.array(z.string()).optional(),
});

const updatePetSchema = petSchema.partial().omit({ userId: true, typeId: true });

// Helper to sanitize Raw SQL results (convert BigInt to Number)
const sanitizeResult = (data) => {
  return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? Number(v) : v));
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const rawPets = await prisma.$queryRaw`SELECT * FROM pets WHERE userId = ${userId}`;
    const pets = sanitizeResult(rawPets);

    const decayedPets = Array.isArray(pets) ? pets.map(pet => {
      const lastInt = pet.lastInteraction ? new Date(pet.lastInteraction) : new Date();
      const hoursElapsed = (new Date() - lastInt) / (1000 * 60 * 60);
      return {
        ...pet,
        isActive: pet.isActive === 1 || pet.isActive === true,
        fullness: Math.max(0, (pet.fullness || 80) - Math.floor(hoursElapsed * 5)),
        cleanliness: Math.max(0, (pet.cleanliness || 90) - Math.floor(hoursElapsed * 3)),
        mood: Math.max(0, (pet.mood || 85) - Math.floor(hoursElapsed * 2)),
      };
    }) : [];
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { unlockedPets: true }
    });

    return NextResponse.json({ 
      pets: decayedPets, 
      unlockedPets: user?.unlockedPets ? JSON.parse(user.unlockedPets) : ['corgi'] 
    });
  } catch (error) {
    console.error('Fetch pets error:', error);
    return NextResponse.json({ error: '获取失败', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = petSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });

    const data = validation.data;
    const now = new Date();

    // Use sequential execution instead of transaction to avoid "Transaction not found" timeouts
    if (data.isActive) {
      await prisma.$executeRaw`UPDATE pets SET isActive = 0 WHERE userId = ${data.userId}`;
    }

    const randomId = 'p-' + crypto.randomBytes(4).toString('hex');
    await prisma.$executeRaw`
      INSERT INTO pets (id, name, typeId, level, intimacy, fullness, cleanliness, mood, isActive, userId, lastInteraction)
      VALUES (${randomId}, ${data.name}, ${data.typeId}, ${data.level}, ${data.intimacy}, ${data.fullness}, ${data.cleanliness}, ${data.mood}, ${data.isActive ? 1 : 0}, ${data.userId}, ${now})
      ON DUPLICATE KEY UPDATE
        name = ${data.name}, level = ${data.level}, intimacy = ${data.intimacy}, 
        fullness = ${data.fullness}, cleanliness = ${data.cleanliness}, mood = ${data.mood},
        isActive = ${data.isActive ? 1 : 0}, lastInteraction = ${now}
    `;

    if (data.unlockedPets) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { unlockedPets: JSON.stringify(data.unlockedPets) }
      });
    }

    const saved = await prisma.$queryRaw`SELECT * FROM pets WHERE userId = ${data.userId} AND typeId = ${data.typeId} LIMIT 1`;
    return NextResponse.json(sanitizeResult(saved[0] || { ...data, isActive: !!data.isActive }));

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: '操作失败', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const typeId = searchParams.get('typeId');
    const body = await request.json();

    if (!userId || !typeId) return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    const now = new Date();
    
    await prisma.$executeRaw`
      UPDATE pets 
      SET 
        name = ${body.name || '我的小宠'}, level = ${body.level || 1}, intimacy = ${body.intimacy || 0},
        fullness = ${body.fullness || 80}, cleanliness = ${body.cleanliness || 90}, mood = ${body.mood || 85},
        lastInteraction = ${now}
      WHERE userId = ${userId} AND typeId = ${typeId}
    `;

    if (body.unlockedPets) {
      await prisma.user.update({
        where: { id: userId },
        data: { unlockedPets: JSON.stringify(body.unlockedPets) }
      });
    }

    const updated = await prisma.$queryRaw`SELECT * FROM pets WHERE userId = ${userId} AND typeId = ${typeId} LIMIT 1`;
    return NextResponse.json(sanitizeResult(updated[0]));
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: '更新失败', details: error.message }, { status: 500 });
  }
}
