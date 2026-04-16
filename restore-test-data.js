const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test data...');

    // Create Doctor
    const doctor = await prisma.doctor.create({
      data: {
        name: 'Dr. Atif',
        email: 'atif.doctor@example.com',
        password: 'hashed_password',
        phone: '03001234567',
        city: 'Karachi',
        state: 'Sindh',
        specialty: 'Pediatrics',
        licenseNumber: 'LIC123456',
        yearsOfExperience: 10,
        consultationFee: 2000,
        serviceMode: 'CLINIC',
        isVerified: true
      }
    });
    console.log('✓ Doctor created:', doctor.id, doctor.name);

    // Create Parent
    const parent = await prisma.parent.create({
      data: {
        name: 'Abdullah Nadeem',
        email: 'parent@example.com',
        password: 'hashed_password',
        isVerified: true,
        childIds: []
      }
    });
    console.log('✓ Parent created:', parent.id, parent.name);

    // Create Child
    const child = await prisma.child.create({
      data: {
        name: 'Sarah Nadeem',
        type: 'GIRL',
        birthday: new Date('2023-06-15'),
        height: 70,
        weight: 10,
        relationIds: [],
        parentIds: [parent.id]
      }
    });
    console.log('✓ Child created:', child.id, child.name);

    // Update parent to include child
    await prisma.parent.update({
      where: { id: parent.id },
      data: { childIds: [child.id] }
    });
    console.log('✓ Parent updated with child');

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        parentId: parent.id,
        doctorId: doctor.id,
        appointmentDate: new Date(),
        consultationFee: 2000,
        paymentMethod: 'SELF',
        status: 'ACCEPTED'
      }
    });
    console.log('✓ Appointment created:', appointment.id, 'Status: ACCEPTED');

    console.log('\n✅ Test data created successfully!');
    console.log('You can now login as the doctor and see the patient');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
