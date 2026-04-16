const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctorId = '69dceeeeae3e39beb5addd16';
  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
    include: { parent: true, child: true }
  });
  
  console.log('Total Appointments:', appointments.length);
  appointments.forEach((a, i) => {
    console.log(`Appt ${i+1}: ID=${a.id}, Date=${a.appointmentDate}, Status=${a.status}, Parent=${a.parentId}, Child=${a.childId}`);
  });
}

main().finally(() => prisma.$disconnect());
