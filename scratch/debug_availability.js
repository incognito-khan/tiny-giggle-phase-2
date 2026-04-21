import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const doctorId = "69dceeeeae3e39beb5addd16"
  const day = "Thu" // 2026-04-16 is a Thursday
  
  const availability = await prisma.availability.findMany({
    where: { 
        OR: [
            { doctorId: doctorId },
            { babysitterId: doctorId }
        ]
    }
  })
  
  console.log("Availability for ID", doctorId)
  console.log(JSON.stringify(availability, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
