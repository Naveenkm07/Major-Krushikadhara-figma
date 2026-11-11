import { discoverNearbyMandisWithPrices } from "../services/mandi.service.js"

async function run() {
  console.log("Testing user location with 60km radius...")
  const res = await discoverNearbyMandisWithPrices({
    lat: 12.92516,
    lng: 77.69743,
    crop: "Tomato",
    radiusKm: 60,
  })

  console.log("Found:", res.totalMandisFound)
  res.results.forEach((r) => {
    console.log(`- ${r.mandi} (${r.district}): ${r.distanceKm} km | hasPrice: ${r.hasPrice} | modal: ₹${r.modalPrice}/Q (₹${r.modalPriceKg}/kg)`)
  })
}

run().then(() => process.exit(0))
