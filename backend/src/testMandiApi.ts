import { discoverNearbyMandisWithPrices } from "./services/mandi.service.js"
import { prisma } from "./config/db.js"

async function test() {
  console.log("🔍 [Test] Testing GPS Nearest Mandi Discovery...")

  const res = await discoverNearbyMandisWithPrices({
    lat: 12.5244,
    lng: 76.8958,
    crop: "Tomato",
    radiusKm: 50,
    limit: 5,
  })

  console.log(`✅ Success: ${res.success}, Mandis: ${res.totalMandisFound}`)
  res.results.forEach((m, idx) => {
    console.log(
      `   ${idx + 1}. ${m.mandi} (${m.district}) - ${m.distanceKm} km away | Modal: ₹${m.modalPrice}/Q (₹${m.modalPriceKg}/kg) | Trade today: ${m.hasPrice}`
    )
  })
}

test()
  .catch((e) => {
    console.error("❌ Test failed:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
