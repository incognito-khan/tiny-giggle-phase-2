const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.doctor.findFirst({
    where: { name: { contains: 'Atif' } }
  });
  console.log('DOCTOR:', JSON.stringify(doctor, null, 2));

  if (doctor) {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id }
    });
    console.log('APPOINTMENTS_COUNT:', appointments.length);
    console.log('APPOINTMENTS:', JSON.stringify(appointments.slice(0, 5), null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
