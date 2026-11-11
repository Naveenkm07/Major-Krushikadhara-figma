import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.mandi.count()
  console.log(`\n========================================`)
  console.log(`Total Mandis stored in Neon PostgreSQL: ${count}`)
  console.log(`========================================\n`)

  const allMandis = await prisma.mandi.findMany({
    orderBy: { district: "asc" },
  })

  allMandis.forEach((m, idx) => {
    console.log(
      `${(idx + 1).toString().padStart(2, " ")}. ${m.name.padEnd(28, " ")} | District: ${(m.district || "").padEnd(16, " ")} | Coordinates: (${m.latitude}, ${m.longitude}) | Verified: ${m.isVerified}`
    )
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
  })

