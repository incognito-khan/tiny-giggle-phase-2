const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.doctor.count({ where: { isDeleted: false } });
  const verified = await prisma.doctor.count({ where: { isDeleted: false, isVerified: true } });
  const paid = await prisma.doctor.count({ where: { isDeleted: false, isPaid: true } });
  const verifiedAndPaid = await prisma.doctor.count({ where: { isDeleted: false, isVerified: true, isPaid: true } });
  
  console.log({ all, verified, paid, verifiedAndPaid });
  process.exit(0);
}

check();
