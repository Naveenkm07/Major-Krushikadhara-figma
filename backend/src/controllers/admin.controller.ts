import type { Request, Response } from "express"
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
  getFallbackTips,
  normalizeFallbackMobile,
  updateFarmerSoil,
  getAllBroadcastAdvisories,
  addBroadcastAdvisory,
  deleteBroadcastAdvisory,
  getAllSchemeApplications,
  updateSchemeApplicationStatus,
} from "../services/farmerFallback.service.js"
import { CROPS_CATALOG } from "../data/cropCalendarCatalog.js"

export async function getStatsHandler(_req: Request, res: Response) {
  try {
    const stats = getAdminAggregateStats()
    res.json({ success: true, stats })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch stats" })
  }
}

export async function listFarmersHandler(req: Request, res: Response) {
  try {
    const { query, district, crop, health } = req.query as Record<string, string | undefined>
    let farmers = getAllFallbackFarmers()

    if (district && district !== "ALL") {
      farmers = farmers.filter((f) => f.district.toLowerCase() === district.toLowerCase())
    }

    if (crop && crop !== "ALL") {
      farmers = farmers.filter((f) =>
        f.activeCrops?.some((c) => c.cropName.toLowerCase().includes(crop.toLowerCase()))
      )
    }

    if (health && health !== "ALL") {
      farmers = farmers.filter((f) =>
        f.activeCrops?.some((c) => c.healthStatus.toLowerCase() === health.toLowerCase())
      )
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase()
      farmers = farmers.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.nameKn.includes(q) ||
          f.mobile.includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.taluk.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q)
      )
    }

    res.json({
      success: true,
      count: farmers.length,
      farmers,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to list farmers" })
  }
}

export async function getFarmerHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const farmer = getOrCreateFallbackFarmer(mobile)
    const scans = getFallbackScans(mobile)
    const tips = getFallbackTips(mobile)

    res.json({
      success: true,
      farmer,
      scans,
      tips,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch farmer" })
  }
}

export async function createFarmerHandler(req: Request, res: Response) {
  try {
    const { mobile, name, nameKn, district, taluk, village, farmSize, soilType, irrigationType, rtcVerified } = req.body
    if (!mobile || !name) {
      res.status(400).json({ success: false, error: "Mobile number and Name are required" })
      return
    }

    const norm = normalizeFallbackMobile(mobile)
    const created = updateFallbackFarmerFields(norm, {
      mobile: norm,
      name,
      nameKn: nameKn || name,
      district: district || "Mandya",
      taluk: taluk || "Central",
      village: village || "Rural",
      farmSize: parseFloat(farmSize) || 3.0,
      soilType: soilType || "Red Loam",
      irrigationType: irrigationType || "Borewell + Drip",
      rtcVerified: Boolean(rtcVerified),
      activeCrops: req.body.activeCrops || [],
    })

    res.status(201).json({ success: true, farmer: created })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to create farmer" })
  }
}

export async function updateFarmerHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const updated = updateFallbackFarmerFields(mobile, req.body)
    res.json({ success: true, farmer: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to update farmer" })
  }
}

export async function deleteFarmerHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const deleted = deleteFallbackFarmerByMobile(mobile)
    res.json({ success: true, deleted, mobile })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to delete farmer" })
  }
}

export async function addPlotHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const { cropName, variety, acreage, season, irrigationMethod, daysSinceSowing, healthStatus } = req.body

    const days = Math.max(1, parseInt(daysSinceSowing, 10) || 30)
    const sowingDate = new Date(Date.now() - days * 86400000).toISOString()
    const newPlot = {
      id: `plot-${mobile}-${Date.now()}`,
      cropName: cropName || "Rice (Paddy)",
      variety: variety || "Local High-Yield",
      acreage: parseFloat(acreage) || 1.0,
      season: season || "Kharif",
      irrigationMethod: irrigationMethod || "Drip",
      sowingDate,
      currentStage: "TILLERING_VEGETATIVE",
      stageDayCount: days,
      healthStatus: healthStatus || "HEALTHY",
      latestFarmerNote: req.body.latestFarmerNote || null,
    }

    const updated = addPlotToFallbackFarmer(mobile, newPlot)
    res.status(201).json({ success: true, plot: newPlot, farmer: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to add plot" })
  }
}

export async function updatePlotHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const { plotId } = req.params
    const updated = updatePlotInFallbackFarmer(mobile, plotId, req.body)
    res.json({ success: true, farmer: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to update plot" })
  }
}

export async function deletePlotHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const { plotId } = req.params
    const updated = deletePlotFromFallbackFarmer(mobile, plotId)
    res.json({ success: true, farmer: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to delete plot" })
  }
}

export async function resetProfilesHandler(_req: Request, res: Response) {
  try {
    const restored = resetAllFallbackFarmersToSeed()
    res.json({
      success: true,
      message: "Reset all 10 authentic Karnataka farmer profiles to default seed state",
      count: restored.length,
      farmers: restored,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to reset profiles" })
  }
}

export async function getCropsListHandler(_req: Request, res: Response) {
  try {
    res.json({
      success: true,
      crops: CROPS_CATALOG.map((c) => ({
        id: c.id,
        nameEn: c.nameEn,
        nameKn: c.nameKn,
        scientificName: c.scientificName,
        category: c.category,
        categoryKn: c.categoryKn,
        totalDays: c.totalDays,
        isPerennial: Boolean(c.isPerennial),
        popularVarieties: c.popularVarieties,
        seasons: c.seasons,
        soilType: c.soilType,
        soilTypeKn: c.soilTypeKn,
        iconName: c.iconName,
        stages: c.stages,
      })),
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch crops list" })
  }
}

export async function updateSoilHandler(req: Request, res: Response) {
  try {
    const mobile = normalizeFallbackMobile(req.params.mobile)
    const { soilN, soilP, soilK, soilPh, soilType } = req.body
    const updated = updateFarmerSoil(mobile, { soilN, soilP, soilK, soilPh, soilType })
    res.json({ success: true, farmer: updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to update soil diagnostics" })
  }
}

export async function exportFarmersHandler(req: Request, res: Response) {
  try {
    const format = (req.query.format as string) || "csv"
    const farmers = getAllFallbackFarmers()

    if (format === "json") {
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", 'attachment; filename="krushikadhara-farmers-export.json"')
      res.send(JSON.stringify(farmers, null, 2))
      return
    }

    // CSV format
    const headers = [
      "Mobile",
      "Name",
      "Name_Kannada",
      "District",
      "Taluk",
      "Village",
      "FarmSize_Acres",
      "SoilType",
      "Soil_pH",
      "Soil_N",
      "Soil_P",
      "Soil_K",
      "Irrigation",
      "RTC_Verified",
      "Active_Plots_Count",
      "Crops_Planted",
      "Health_Alerts",
    ]

    const rows = farmers.map((f) => {
      const plots = f.activeCrops || []
      const cropList = plots.map((p) => `${p.cropName} (${p.acreage} ac)`).join("; ")
      const alerts = plots
        .filter((p) => p.healthStatus !== "HEALTHY")
        .map((p) => `${p.cropName}: ${p.healthStatus}`)
        .join("; ")

      return [
        `"${f.mobile}"`,
        `"${(f.name || "").replace(/"/g, '""')}"`,
        `"${(f.nameKn || "").replace(/"/g, '""')}"`,
        `"${f.district || ""}"`,
        `"${f.taluk || ""}"`,
        `"${f.village || ""}"`,
        f.farmSize || 0,
        `"${f.soilType || ""}"`,
        f.soilPh ?? "N/A",
        f.soilN ?? "N/A",
        f.soilP ?? "N/A",
        f.soilK ?? "N/A",
        `"${f.irrigationType || ""}"`,
        f.rtcVerified ? "YES" : "NO",
        plots.length,
        `"${cropList.replace(/"/g, '""')}"`,
        `"${alerts.replace(/"/g, '""')}"`,
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\r\n")

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", 'attachment; filename="krushikadhara-farmers-export.csv"')
    res.send("\uFEFF" + csvContent) // UTF-8 BOM for Excel Kannada font support
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to export farmers" })
  }
}

export async function getBroadcastsHandler(_req: Request, res: Response) {
  try {
    const broadcasts = getAllBroadcastAdvisories()
    res.json({ success: true, broadcasts })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch broadcasts" })
  }
}

export async function addBroadcastHandler(req: Request, res: Response) {
  try {
    const { titleEn, titleKn, category, targetDistrict, targetCrop, urgency, messageEn, messageKn } = req.body
    if (!titleEn || !messageEn) {
      res.status(400).json({ success: false, error: "Title and Message are required" })
      return
    }

    const created = addBroadcastAdvisory({
      titleEn,
      titleKn: titleKn || titleEn,
      category: category || "WEATHER_ALERT",
      targetDistrict: targetDistrict || "ALL",
      targetCrop: targetCrop || "ALL",
      urgency: urgency || "MODERATE",
      messageEn,
      messageKn: messageKn || messageEn,
    })

    res.status(201).json({ success: true, broadcast: created })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to create broadcast advisory" })
  }
}

export async function deleteBroadcastHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = deleteBroadcastAdvisory(id)
    res.json({ success: true, deleted, id })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to delete broadcast" })
  }
}

export async function getSchemesOverviewHandler(_req: Request, res: Response) {
  try {
    const applications = getAllSchemeApplications()
    res.json({ success: true, applications })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch schemes applications" })
  }
}

export async function updateSchemeStatusHandler(req: Request, res: Response) {
  try {
    const { farmerMobile, schemeId, status, disbursedAmount } = req.body
    if (!farmerMobile || !schemeId || !status) {
      res.status(400).json({ success: false, error: "farmerMobile, schemeId and status are required" })
      return
    }
    const updated = updateSchemeApplicationStatus(farmerMobile, schemeId, status, disbursedAmount)
    res.json({ success: true, updated })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to update scheme status" })
  }
}

