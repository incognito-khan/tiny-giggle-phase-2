const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestAccounts() {
  try {
    console.log('Creating test accounts with hashed passwords...\n');

    // Hash password: "test123"
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create Doctor
    await prisma.doctor.deleteMany({ where: { email: 'doctor@test.com' } });
    const doctor = await prisma.doctor.create({
      data: {
        name: 'Dr. Ahmed Khan',
        email: 'doctor@test.com',
        password: hashedPassword,
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
    console.log('✅ DOCTOR ACCOUNT CREATED');
    console.log('   Email: doctor@test.com');
    console.log('   Password: test123\n');

    // Create Parent
    await prisma.parent.deleteMany({ where: { email: 'parent@test.com' } });
    const parent = await prisma.parent.create({
      data: {
        name: 'Muhammad Ali',
        email: 'parent@test.com',
        password: hashedPassword,
        isVerified: true,
        childIds: []
      }
    });
    console.log('✅ PARENT ACCOUNT CREATED');
    console.log('   Email: parent@test.com');
    console.log('   Password: test123\n');

    // Create Child
    const child = await prisma.child.create({
      data: {
        name: 'Fatima Ali',
        type: 'GIRL',
        birthday: new Date('2023-06-15'),
        height: 70,
        weight: 10,
        relationIds: [],
        parentIds: [parent.id]
      }
    });

    // Update parent with child
    await prisma.parent.update({
      where: { id: parent.id },
      data: { childIds: [child.id] }
    });
    console.log('✅ PATIENT (CHILD) CREATED');
    console.log('   Name: Fatima Ali');
    console.log('   Parent: Muhammad Ali\n');

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
    console.log('✅ APPOINTMENT CREATED');
    console.log('   Status: ACCEPTED');
    console.log('   Doctor: Dr. Ahmed Khan');
    console.log('   Parent: Muhammad Ali\n');

    console.log('════════════════════════════════════════');
    console.log('✅ ALL TEST ACCOUNTS READY TO USE');
    console.log('════════════════════════════════════════\n');
    console.log('USE THESE CREDENTIALS TO LOGIN:\n');
    console.log('🩺 DOCTOR LOGIN:');
    console.log('   Email: doctor@test.com');
    console.log('   Password: test123\n');
    console.log('👨‍👩‍👧 PARENT LOGIN:');
    console.log('   Email: parent@test.com');
    console.log('   Password: test123\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccounts();
