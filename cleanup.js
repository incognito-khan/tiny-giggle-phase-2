const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.doctor.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.child.deleteMany({});
    await prisma.appointment.deleteMany({});
    console.log('✓ Cleaned up old data');
  } finally {
    await prisma.$disconnect();
  }
})();
