import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const doctorId = "69dceeeeae3e39beb5addd16"
  
  await prisma.availability.updateMany({
    where: { doctorId: doctorId },
    data: {
      startTime: "09:00",
      endTime: "17:00"
    }
  })
  
  console.log("Updated availability for doctor", doctorId, "to 09:00 - 17:00")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
