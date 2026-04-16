const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const doctors = await prisma.doctor.findMany();
    console.log('Doctors:', doctors.length);
    doctors.forEach(d => console.log('  -', d.id, d.name, d.email));
    
    const parents = await prisma.parent.findMany();
    console.log('\nParents:', parents.length);
    parents.forEach(p => console.log('  -', p.id, p.name, 'children:', p.childIds));
    
    const children = await prisma.child.findMany();
    console.log('\nChildren:', children.length);
    children.forEach(c => console.log('  -', c.id, c.name, 'parents:', c.parentIds));
    
    const appointments = await prisma.appointment.findMany();
    console.log('\nAppointments:', appointments.length);
    appointments.forEach(a => console.log('  -', a.id, 'parentId:', a.parentId, 'doctorId:', a.doctorId, 'status:', a.status));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
