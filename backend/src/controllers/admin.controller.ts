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
        category: c.category,
        popularVarieties: c.popularVarieties,
      })),
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to fetch crops list" })
  }
}

