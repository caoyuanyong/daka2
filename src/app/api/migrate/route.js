export const runtime = 'edge';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to add the column
    await prisma.$executeRaw`ALTER TABLE pets ADD COLUMN gender VARCHAR(191) NOT NULL DEFAULT 'male' AFTER mood`;
    return NextResponse.json({ success: true, message: 'Gender column added successfully' });
  } catch (error) {
    // Check if it's "Duplicate column name" error (MySQL code 1060)
    if (error.message.includes('1060') || error.message.includes('Duplicate column')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Gender column already exists',
        warning: 'Skip migration'
      });
    }
    
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
