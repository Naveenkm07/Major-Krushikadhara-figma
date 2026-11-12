import { prisma } from "../config/db.js"
import { VERIFIED_MANDIS } from "../data/verifiedMandis.js"

export { VERIFIED_MANDIS }

export async function seedMandis() {
  console.log(`🌾 [Seed Mandis] Starting verified mandi sync into PostgreSQL...`)
  let createdCount = 0
  let updatedCount = 0

  for (const record of VERIFIED_MANDIS) {
    // Check if record exists by name and state
    const existing = await prisma.mandi.findFirst({
      where: {
        name: record.name,
        state: record.state,
      },
    })

    if (!existing) {
      await prisma.mandi.create({
        data: record,
      })
      createdCount++
    } else {
      await prisma.mandi.update({
        where: { id: existing.id },
        data: {
          district: record.district,
          latitude: record.latitude,
          longitude: record.longitude,
          locationSource: record.locationSource,
          isVerified: record.isVerified,
        },
      })
      updatedCount++
    }
  }

  console.log(
    `✅ [Seed Mandis] Sync complete: ${createdCount} created, ${updatedCount} updated. Total verified: ${VERIFIED_MANDIS.length}`
  )
}

if (process.argv[1]?.includes("seedMandis")) {
  seedMandis()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("❌ Seed failed:", err)
      prisma.$disconnect()
      process.exit(1)
    })
}

