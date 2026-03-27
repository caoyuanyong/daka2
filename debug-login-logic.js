const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function simulateLogin() {
  const username = 'cyy123';
  const password = '...'; // Not knowing, but I'll use the hash
  const SAFE_JWT_SECRET = 'bj-family-dev-secret-key';

  try {
    const family = await prisma.family.findUnique({
      where: { username },
      include: { members: true }
    });

    if (!family) { console.log('Family not found'); return; }

    console.log('Testing bcrypt.compare...');
    // Real password for cyy123 is likely '123456' as per common seeds, but I'll just check if it throws
    try {
      await bcrypt.compare('123456', family.password);
      console.log('bcrypt.compare worked (not necessarily matched)');
    } catch (bErr) {
      console.error('bcrypt.compare ERROR:', bErr);
      throw bErr;
    }

    const token = jwt.sign(
      { familyId: family.id, username: family.username },
      SAFE_JWT_SECRET,
      { expiresIn: '30d' }
    );
    console.log('JWT signed.');

    const responseData = {
      family: {
        id: family.id,
        username: family.username,
        isVip: family.isVip,
        vipExpiry: family.vipExpiry.toString()
      },
      members: family.members,
      token
    };

    const jsonStr = JSON.stringify(responseData);
    console.log('Serialized JSON length:', jsonStr.length);

  } catch (error) {
    console.error('SIMULATION ERROR:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await prisma.$disconnect();
  }
}

simulateLogin();
