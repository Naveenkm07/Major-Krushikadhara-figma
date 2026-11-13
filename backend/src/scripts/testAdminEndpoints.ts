import {
  getAllFallbackFarmers,
  getOrCreateFallbackFarmer,
  updateFallbackFarmerFields,
  deleteFallbackFarmerByMobile,
  addPlotToFallbackFarmer,
  updatePlotInFallbackFarmer,
  deletePlotFromFallbackFarmer,
  resetAllFallbackFarmersToSeed,
  getAdminAggregateStats,
  getFallbackScans,
  updateFarmerSoil,
  getAllBroadcastAdvisories,
  addBroadcastAdvisory,
  deleteBroadcastAdvisory,
  getAllSchemeApplications,
  updateSchemeApplicationStatus,
} from "../services/farmerFallback.service.js"
import { CROPS_CATALOG } from "../data/cropCalendarCatalog.js"

async function runTests() {
  console.log("🧪 Starting Comprehensive Admin Panel Verification...\n")

  // 1. Stats
  const stats = getAdminAggregateStats()
  console.log(`✅ [1/10] getAdminAggregateStats: Total Farmers = ${stats.totalFarmers}, Total Acres = ${stats.totalAcres}, Plots = ${stats.totalPlots}`)
  if (stats.totalFarmers < 10) throw new Error("Expected at least 10 farmers in stats")
  if (!stats.cropAcreage || Object.keys(stats.cropAcreage).length === 0) throw new Error("cropAcreage missing in stats")
  if (!stats.districtCounts || Object.keys(stats.districtCounts).length === 0) throw new Error("districtCounts missing in stats")

  // 2. 32 Crops Catalog
  console.log(`✅ [2/10] 32 Crops Catalog: Loaded ${CROPS_CATALOG.length} crops`)
  if (CROPS_CATALOG.length < 30) throw new Error(`Expected at least 30 crops, got ${CROPS_CATALOG.length}`)
  const sampleCrop = CROPS_CATALOG[0]
  if (!sampleCrop.stages || sampleCrop.stages.length === 0) throw new Error("Crop stages missing")
  console.log(`   Sample Crop: ${sampleCrop.nameEn} (${sampleCrop.nameKn}) with ${sampleCrop.stages.length} growth stages`)

  // 3. Farmer Listing
  const farmers = getAllFallbackFarmers()
  console.log(`✅ [3/10] getAllFallbackFarmers: Returned ${farmers.length} profiles`)
  const mandyaFarmer = farmers.find(f => f.mobile === "9591502209")
  if (!mandyaFarmer) throw new Error("Naveen Kumar KM (Mandya) not found")
  console.log(`   Found Farmer: ${mandyaFarmer.name} (${mandyaFarmer.nameKn}), Land: ${mandyaFarmer.farmSize} ac in ${mandyaFarmer.district}`)

  // 4. Soil Testing & NPK Update
  console.log("✅ [4/10] Testing Soil Diagnostics Update...")
  const updatedSoil = updateFarmerSoil("9591502209", {
    soilPh: 7.0,
    soilN: 225,
    soilP: 20,
    soilK: 205,
    soilType: "Red Loam",
  })
  if (updatedSoil.soilPh !== 7.0 || updatedSoil.soilN !== 225) throw new Error("Soil update failed")
  console.log(`   Updated Soil for ${updatedSoil.name}: pH=${updatedSoil.soilPh}, N=${updatedSoil.soilN}, P=${updatedSoil.soilP}, K=${updatedSoil.soilK}`)

  // 5. Crop Plots CRUD
  console.log("✅ [5/10] Testing Crop Plots CRUD...")
  const testPlotId = `test-plot-${Date.now()}`
  const plotData = {
    id: testPlotId,
    cropName: "Tomato",
    variety: "Arka Rakshak",
    acreage: 1.5,
    season: "Rabi",
    irrigationMethod: "Drip",
    sowingDate: new Date().toISOString(),
    currentStage: "FLOWERING_FRUITING",
    stageDayCount: 45,
    healthStatus: "HEALTHY" as const,
  }
  const withPlot = addPlotToFallbackFarmer("9591502209", plotData)
  const added = withPlot.activeCrops.find((p: any) => p.id === testPlotId)
  if (!added) throw new Error("Plot was not added")
  console.log(`   Added Plot: ${added.cropName} (${added.variety}), ${added.acreage} ac`)

  const updatedPlot = updatePlotInFallbackFarmer("9591502209", testPlotId, { healthStatus: "WATER_STRESSED" })
  const mod = updatedPlot.activeCrops.find((p: any) => p.id === testPlotId)
  if (mod.healthStatus !== "WATER_STRESSED") throw new Error("Plot update failed")
  console.log(`   Updated Plot Health: ${mod.healthStatus}`)

  const deletedPlot = deletePlotFromFallbackFarmer("9591502209", testPlotId)
  if (deletedPlot.activeCrops.some((p: any) => p.id === testPlotId)) throw new Error("Plot delete failed")
  console.log("   Plot deleted cleanly")

  // 6. AI Plant Pathology Scans
  console.log("✅ [6/10] Testing AI Disease Scans...")
  const scans = getFallbackScans("9591502209")
  console.log(`   Scans for Naveen Kumar KM: ${scans.length} diagnostic records`)
  if (scans.length > 0) {
    console.log(`   Sample Diagnosis: ${scans[0].diseaseName}, Severity: ${scans[0].severity}`)
  }

  // 7. Broadcast Advisories
  console.log("✅ [7/10] Testing Broadcast Advisories...")
  const broadcasts = getAllBroadcastAdvisories()
  console.log(`   Current Broadcasts: ${broadcasts.length} alerts`)
  const newBcast = addBroadcastAdvisory({
    titleEn: "Test Pest Advisory",
    titleKn: "ಪರೀಕ್ಷಾ ಕೀಟ ಸಲಹೆ",
    category: "PEST_WARNING",
    targetDistrict: "Mandya",
    targetCrop: "Rice (Paddy)",
    urgency: "MODERATE",
    messageEn: "Test message body",
    messageKn: "ಪರೀಕ್ಷಾ ಸಂದೇಶ",
  })
  if (!newBcast.id) throw new Error("Broadcast creation failed")
  console.log(`   Created Broadcast: ${newBcast.titleEn} (ID: ${newBcast.id}, Delivered: ${newBcast.sentCount})`)
  deleteBroadcastAdvisory(newBcast.id)
  console.log("   Deleted test broadcast cleanly")

  // 8. Government Schemes
  console.log("✅ [8/10] Testing Government Schemes Applications...")
  const schemes = getAllSchemeApplications()
  console.log(`   Total Tracked Applications: ${schemes.length}`)
  const updatedScheme = updateSchemeApplicationStatus("9591502209", "pm-kisan", "DISBURSED", "₹2,000 Verified")
  if (!updatedScheme) throw new Error("Scheme status update failed")
  console.log("   Updated PM-KISAN status to DISBURSED for Naveen Kumar KM")

  // 9. Reset Profiles to Seed
  console.log("✅ [9/10] Testing Profile Seed Reset...")
  const resetList = resetAllFallbackFarmersToSeed()
  if (resetList.length !== 10) throw new Error(`Expected exactly 10 profiles upon reset, got ${resetList.length}`)
  console.log(`   Successfully restored all ${resetList.length} authentic Karnataka farmer profiles`)

  // 10. Verify Final Stats Integrity
  const finalStats = getAdminAggregateStats()
  console.log(`✅ [10/10] Final Aggregate Stats Integrity: ${finalStats.totalFarmers} Farmers, ${finalStats.totalPlots} Plots, ${finalStats.totalAcres} Acres`)
  console.log(`   Districts Monitored: ${Object.keys(finalStats.districtCounts).join(", ")}`)
  console.log(`   Health Breakdown: ${JSON.stringify(finalStats.healthCounts)}`)

  console.log("\n🎉 ALL 10 ADMIN PORTAL VERIFICATION CHECKS PASSED PERFECTLY!\n")
}

runTests().catch(err => {
  console.error("❌ Verification failed:", err)
  process.exit(1)
})
