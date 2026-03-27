const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const familyCount = await prisma.family.count();
    console.log('Database connected successfully. Family count:', familyCount);
    
    // Test finding a family
    const firstFamily = await prisma.family.findFirst();
    console.log('First family:', firstFamily);
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
