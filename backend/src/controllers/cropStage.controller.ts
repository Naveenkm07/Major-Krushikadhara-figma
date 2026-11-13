import type { Request, Response } from "express"
import { prisma, withDbRetry } from "../config/db.js"
import {
  getCropGrowthStage,
  getStagesForCrop,
  generateStageAwareAdvice,
  getAllCropsCatalog,
} from "../services/stageAdvisory.service.js"
import {
  CROPS_CATALOG,
  findCropInCatalog,
  calculateDynamicCropStage,
  CROP_CATEGORIES,
} from "../data/cropCalendarCatalog.js"
import { transcribeAudioWithSarvam } from "../services/sarvam.service.js"
import { getAgriAdvisory } from "../services/gemini.service.js"
import {
  cacheFallbackFarmer,
  getOrCreateFallbackFarmer,
} from "../services/farmerFallback.service.js"

function normalizeMobile(raw: unknown): string {
  const digits = String(raw || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : "9591502209"
}

interface FarmerWithCropResult {
  farmer: {
    id: string | null
    name: string | null
    nameKn?: string | null
    district: string | null
  }
  activeField: {
    id: string
    cropName: string
    variety: string | null
    sowingDate: Date
    currentStage: string
    healthStatus: string
    latestFarmerNote: string | null
  }
  dbBacked: boolean
}

async function findOrCreateFarmerWithCrop(mobile: string, preferredFieldId?: string): Promise<FarmerWithCropResult & { allFields: any[] }> {
  try {
    return await withDbRetry(async () => {
      let farmer = await prisma.farmer.findUnique({
        where: { mobile },
        include: {
          activeCrops: {
            orderBy: { createdAt: "asc" },
          },
        },
      })

      if (!farmer) {
        const fb = getOrCreateFallbackFarmer(mobile)
        farmer = await prisma.farmer.create({
          data: {
            mobile,
            name: fb.name,
            district: fb.district,
            state: fb.state || "Karnataka",
            taluk: fb.taluk,
            village: fb.village,
            farmSize: Number(fb.farmSize) || 4.2,
            experienceYears: Number(fb.experienceYears) || 6,
          },
          include: {
            activeCrops: true,
          },
        })
      }

      let allFields = farmer.activeCrops

      if (!allFields || allFields.length === 0) {
        const sowingDate = new Date()
        sowingDate.setDate(sowingDate.getDate() - 35)

        const created = await prisma.cropField.create({
          data: {
            farmerId: farmer.id,
            cropName: "Rice (Paddy)",
            variety: "BPT 5204 (Sona Masoori)",
            sowingDate,
            currentStage: "TILLERING_VEGETATIVE",
            stageDayCount: 35,
            healthStatus: "HEALTHY",
          },
        })
        allFields = [created]
      }

      const activeField =
        (preferredFieldId && allFields.find((f) => f.id === preferredFieldId)) ||
        allFields[0]

      cacheFallbackFarmer(farmer)
      return { farmer, activeField, allFields, dbBacked: true }
    }, "findOrCreateFarmerWithCrop")
  } catch (err: any) {
    console.warn("⚠️ [CropStage DB Fallback] Using resilient farm store:", err?.message || err)
    const clean = String(mobile || "").replace(/\D/g, "").slice(-10) || "9591502209"
    const fb = getOrCreateFallbackFarmer(clean)
    const fbFields = (fb.activeCrops && fb.activeCrops.length > 0
      ? fb.activeCrops
      : [
          {
            id: "default-field",
            cropName: "Rice (Paddy)",
            variety: "BPT 5204 (Sona Masoori)",
            sowingDate: new Date(Date.now() - 35 * 86400000),
            currentStage: "TILLERING_VEGETATIVE",
            healthStatus: "HEALTHY",
            latestFarmerNote: null,
          },
        ]) as any[]
    const activeField =
      (preferredFieldId && fbFields.find((f) => f.id === preferredFieldId)) ||
      fbFields[0]
    return {
      farmer: {
        id: null,
        name: fb.name || "Naveen Kumar KM",
        nameKn: fb.nameKn || fb.name || "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ",
        district: fb.district || "Mandya",
      },
      activeField,
      allFields: fbFields,
      dbBacked: false,
    }
  }
}

/**
 * GET /api/crop-stage/active?mobile=...&fieldId=...
 * Returns the farmer's active crop field, list of all crop fields, calculated growth stage, and tailored advisories.
 */
export async function getActiveCropStage(req: Request, res: Response) {
  try {
    const mobile = normalizeMobile(req.query.mobile)
    const fieldId = (req.query.fieldId as string) || undefined
    const { farmer, activeField, allFields } = await findOrCreateFarmerWithCrop(mobile, fieldId)

    // Calculate days since sowing
    const now = new Date()
    const diffMs = now.getTime() - new Date(activeField.sowingDate).getTime()
    const daysSinceSowing = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

    // Calculate present stage and advisories dynamically
    const dynamic = calculateDynamicCropStage(activeField.cropName, daysSinceSowing)
    const stageDef = dynamic.currentStage
    const cropCatalogItem = dynamic.crop

    return res.json({
      success: true,
      farmer: {
        name: farmer.name,
        nameKn: farmer.nameKn || farmer.name,
        district: farmer.district,
      },
      cropInfo: {
        id: cropCatalogItem.id,
        nameEn: cropCatalogItem.nameEn,
        nameKn: cropCatalogItem.nameKn,
        category: cropCatalogItem.category,
        categoryKn: cropCatalogItem.categoryKn,
        totalDays: cropCatalogItem.totalDays,
        isPerennial: cropCatalogItem.isPerennial || false,
        popularVarieties: cropCatalogItem.popularVarieties,
        seasons: cropCatalogItem.seasons,
        soilType: cropCatalogItem.soilType,
        soilTypeKn: cropCatalogItem.soilTypeKn,
        iconName: cropCatalogItem.iconName,
      },
      fields: allFields.map((f) => {
        const d = Math.max(1, Math.floor((now.getTime() - new Date(f.sowingDate).getTime()) / 86400000))
        return {
          id: f.id,
          cropName: f.cropName,
          variety: f.variety,
          sowingDate: f.sowingDate,
          daysSinceSowing: d,
          healthStatus: f.healthStatus,
        }
      }),
      cropField: {
        id: activeField.id,
        cropName: activeField.cropName,
        variety: activeField.variety,
        sowingDate: activeField.sowingDate,
        daysSinceSowing,
        currentStageKey: stageDef.key,
        currentStageNameEn: stageDef.nameEn,
        currentStageNameKn: stageDef.nameKn,
        stageDescriptionEn: stageDef.descriptionEn,
        stageDescriptionKn: stageDef.descriptionKn,
        healthStatus: activeField.healthStatus,
        latestNote: activeField.latestFarmerNote,
      },
      dailyAdvisories: stageDef.advisories,
      allStages: dynamic.stages.map((s) => ({
        key: s.key,
        nameEn: s.nameEn,
        nameKn: s.nameKn,
        startDay: s.startDay,
        endDay: s.endDay,
        descriptionEn: s.descriptionEn,
        descriptionKn: s.descriptionKn,
        advisories: s.advisories,
        isCurrent: s.isCurrent,
        isCompleted: s.isCompleted,
        isUpcoming: s.isUpcoming,
        daysRemainingUntilStart: s.daysRemainingUntilStart,
      })),
    })
  } catch (error) {
    console.error("❌ [CropStage Controller] Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active crop stage",
      error: error instanceof Error ? error.message : "Internal Error",
    })
  }
}

/**
 * GET /api/crop-stage/catalog?category=...&query=...
 * Returns the complete 32+ crop calendar directory with summary details
 */
export async function getCropsCatalog(req: Request, res: Response) {
  try {
    const category = (req.query.category as string) || "ALL"
    const query = ((req.query.query as string) || "").trim().toLowerCase()

    let list = CROPS_CATALOG

    if (category && category !== "ALL") {
      list = list.filter((c) => c.category === category)
    }

    if (query) {
      list = list.filter(
        (c) =>
          c.nameEn.toLowerCase().includes(query) ||
          c.nameKn.toLowerCase().includes(query) ||
          c.scientificName.toLowerCase().includes(query) ||
          c.popularVarieties.some((v) => v.toLowerCase().includes(query))
      )
    }

    const summary = list.map((c) => ({
      id: c.id,
      nameEn: c.nameEn,
      nameKn: c.nameKn,
      scientificName: c.scientificName,
      category: c.category,
      categoryKn: c.categoryKn,
      totalDays: c.totalDays,
      isPerennial: c.isPerennial || false,
      popularVarieties: c.popularVarieties,
      seasons: c.seasons,
      soilType: c.soilType,
      soilTypeKn: c.soilTypeKn,
      iconName: c.iconName,
      stagesCount: c.stages.length,
    }))

    return res.json({
      success: true,
      totalCount: CROPS_CATALOG.length,
      filteredCount: summary.length,
      categories: CROP_CATEGORIES,
      crops: summary,
    })
  } catch (error) {
    console.error("❌ [CropStage Catalog Error]:", error)
    return res.status(500).json({
      success: false,
      error: "Failed to load crops catalog",
    })
  }
}

/**
 * GET /api/crop-stage/crop/:cropKey?day=35&sowingDate=...
 * Returns the full lifecycle calendar and dynamic stage calculations for a specific crop
 */
export async function getCropCalendarDetail(req: Request, res: Response) {
  try {
    const { cropKey } = req.params
    const dayQuery = req.query.day ? parseInt(String(req.query.day), 10) : undefined
    const sowingDateQuery = req.query.sowingDate as string | undefined

    const crop = findCropInCatalog(cropKey)
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: `Crop '${cropKey}' not found in catalog`,
      })
    }

    const dayParam = dayQuery !== undefined && !isNaN(dayQuery) ? dayQuery : sowingDateQuery || 35
    const dynamic = calculateDynamicCropStage(crop, dayParam)

    return res.json({
      success: true,
      crop: dynamic.crop,
      elapsedDays: dynamic.elapsedDays,
      totalDays: dynamic.totalDays,
      progressPct: dynamic.progressPct,
      currentStage: dynamic.currentStage,
      currentStageIndex: dynamic.currentStageIndex,
      stages: dynamic.stages,
      dailyAdvisories: dynamic.currentStage.advisories,
    })
  } catch (error) {
    console.error("❌ [CropStage Detail Error]:", error)
    return res.status(500).json({
      success: false,
      error: "Failed to get crop calendar detail",
    })
  }
}

/**
 * PUT /api/crop-stage/:fieldId/sowing-date
 * Updates the sowing date of a crop field and recalculates stages
 */
export async function updateSowingDate(req: Request, res: Response) {
  const { fieldId } = req.params
  const { sowingDate, daysAgo, mobile } = req.body || {}
  const clean = normalizeMobile(mobile)

  try {
    let newSowingDate: Date
    if (sowingDate) {
      newSowingDate = new Date(sowingDate)
    } else if (daysAgo !== undefined) {
      const days = Math.max(1, parseInt(String(daysAgo), 10) || 1)
      newSowingDate = new Date(Date.now() - days * 86400000)
    } else {
      return res.status(400).json({
        success: false,
        error: "Either sowingDate or daysAgo is required",
      })
    }

    const updated = await withDbRetry(
      () =>
        prisma.cropField.update({
          where: { id: fieldId },
          data: {
            sowingDate: newSowingDate,
          },
        }),
      "updateSowingDate"
    )

    return res.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.warn("⚠️ [CropStage Sowing Date Update Fallback]:", error?.message || error)
    const fb = getOrCreateFallbackFarmer(clean)
    let field = fb.activeCrops?.find((f: any) => f.id === fieldId)
    if (!field && fb.activeCrops?.length > 0) {
      field = fb.activeCrops[0]
    }
    if (field) {
      let targetDate: Date
      if (sowingDate) targetDate = new Date(sowingDate)
      else targetDate = new Date(Date.now() - (parseInt(String(daysAgo), 10) || 1) * 86400000)
      field.sowingDate = targetDate
    }
    cacheFallbackFarmer(fb)

    return res.json({
      success: true,
      fallback: true,
      data: field,
    })
  }
}

/**
 * PUT /api/crop-stage/:fieldId/stage
 * Manually update crop stage or sowing date
 */
export async function updateCropStage(req: Request, res: Response) {
  const { fieldId } = req.params
  const { stageKey, healthStatus, latestNote, mobile } = req.body || {}
  const clean = String(mobile || "").replace(/\D/g, "").slice(-10) || "9591502209"

  try {
    const updated = await withDbRetry(
      () =>
        prisma.cropField.update({
          where: { id: fieldId },
          data: {
            currentStage: stageKey || undefined,
            healthStatus: healthStatus || undefined,
            latestFarmerNote: latestNote || undefined,
          },
        }),
      "updateCropStage"
    )

    return res.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.warn("⚠️ [CropStage Update Fallback]:", error?.message || error)
    const fb = getOrCreateFallbackFarmer(clean)
    let field = fb.activeCrops.find((f: any) => f.id === fieldId)
    if (!field && fb.activeCrops.length > 0) {
      field = fb.activeCrops[0]
    }
    if (field) {
      if (stageKey) field.currentStage = stageKey
      if (healthStatus) field.healthStatus = healthStatus
      if (latestNote) field.latestFarmerNote = latestNote
    }
    cacheFallbackFarmer(fb)
    return res.json({
      success: true,
      source: "Resilient Local Store",
      data: field,
    })
  }
}

/**
 * POST /api/crop-stage/voice-input
 * Receives audio file via multipart form, transcribes using Sarvam AI (Kannada/English),
 * evaluates the farmer's observation in the context of their present growth stage,
 * logs interaction to Neon DB, and returns tailored advice!
 */
export async function handleVoiceObservation(req: Request, res: Response) {
  try {
    const file = req.file
    const mobile = normalizeMobile(req.body?.mobile)
    const language = (req.body.language as string) || "kn-IN"

    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided in request",
      })
    }

    // 1. Send audio buffer to Sarvam AI STT
    const sttResult = await transcribeAudioWithSarvam(file.buffer, file.originalname, language)

    if (!sttResult.success || !sttResult.transcript) {
      return res.status(502).json({
        success: false,
        message: "Sarvam STT failed to transcribe voice audio",
        error: sttResult.error || "Empty transcript returned",
      })
    }

    const transcript = sttResult.transcript

    // 2. Load (or auto-provision) farmer's active crop field
    const { farmer, activeField: field, dbBacked } = await findOrCreateFarmerWithCrop(mobile)
    const cropName = field.cropName || "Rice (Paddy)"
    const daysSinceSowing = Math.max(1, Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / 86400000))
    const stageDef = getCropGrowthStage(cropName, daysSinceSowing)
    const isEnglish = (sttResult.languageCode || language).toLowerCase().startsWith("en")

    // 3. Generate agronomy advice tailored to this exact present stage
    let geminiAdvice = ""
    try {
      geminiAdvice = await getAgriAdvisory(transcript, {
        cropName,
        growthStage: `${stageDef.nameKn} (${stageDef.nameEn})`,
        daysSinceSowing,
        district: farmer.district || "Karnataka",
        preferredLanguage: isEnglish ? "en" : "kn",
      })
    } catch (gErr: any) {
      console.warn("⚠️ [Gemini fallback to rule engine]:", gErr?.message || gErr)
    }

    const advice = generateStageAwareAdvice({
      cropName,
      currentStage: stageDef,
      daysSinceSowing,
      farmerQuery: transcript,
      language: sttResult.languageCode,
    })

    const finalAdviceKn = !isEnglish && geminiAdvice ? geminiAdvice : advice.adviceKn
    const finalAdviceEn = isEnglish && geminiAdvice ? geminiAdvice : advice.adviceEn

    // 4. Log interaction in Neon PostgreSQL (best-effort) or resilient local store
    if (dbBacked && farmer.id) {
      const farmerId = farmer.id
      await withDbRetry(async () => {
        await prisma.farmerInteraction.create({
          data: {
            farmerId,
            cropFieldId: field.id,
            inputType: "VOICE",
            language: sttResult.languageCode,
            transcriptText: transcript,
            aiResponseText: isEnglish ? finalAdviceEn : finalAdviceKn,
          },
        })
        await prisma.cropField.update({
          where: { id: field.id },
          data: { latestFarmerNote: transcript },
        })
      }, "logVoiceObservation").catch((dbErr) =>
        console.warn("⚠️ [CropStage Voice Log Warning]:", dbErr?.message || dbErr)
      )
    } else {
      const fb = getOrCreateFallbackFarmer(mobile)
      const fbField = fb.activeCrops?.find((f: any) => f.id === field.id) || fb.activeCrops?.[0]
      if (fbField) fbField.latestFarmerNote = transcript
      cacheFallbackFarmer(fb)
    }

    return res.json({
      success: true,
      transcript,
      language: sttResult.languageCode,
      cropName,
      presentStage: stageDef.nameKn,
      presentStageEn: stageDef.nameEn,
      daysSinceSowing,
      adviceKn: finalAdviceKn,
      adviceEn: finalAdviceEn,
      urgency: advice.urgency,
    })
  } catch (error) {
    console.error("❌ [CropStage Voice Handler Error]:", error)
    return res.status(500).json({
      success: false,
      message: "Error processing voice input",
      error: error instanceof Error ? error.message : "Internal Error",
    })
  }
}

/**
 * POST /api/crop-stage/text-input
 * Receives text query, evaluates against present stage, and returns tailored advice
 */
export async function handleTextObservation(req: Request, res: Response) {
  try {
    const { text, mobile: rawMobile, language = "kn" } = req.body || {}
    const mobile = normalizeMobile(rawMobile)

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text query is required",
      })
    }

    const { farmer, activeField: field, dbBacked } = await findOrCreateFarmerWithCrop(mobile)
    const cropName = field.cropName || "Rice (Paddy)"
    const daysSinceSowing = Math.max(1, Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / 86400000))
    const stageDef = getCropGrowthStage(cropName, daysSinceSowing)
    const isEnglish = String(language).toLowerCase().startsWith("en")

    let geminiAdvice = ""
    try {
      geminiAdvice = await getAgriAdvisory(text, {
        cropName,
        growthStage: `${stageDef.nameKn} (${stageDef.nameEn})`,
        daysSinceSowing,
        district: farmer.district || "Karnataka",
        preferredLanguage: isEnglish ? "en" : "kn",
      })
    } catch (gErr: any) {
      console.warn("⚠️ [Gemini fallback to rule engine]:", gErr?.message || gErr)
    }

    const advice = generateStageAwareAdvice({
      cropName,
      currentStage: stageDef,
      daysSinceSowing,
      farmerQuery: text,
      language,
    })

    const finalAdviceKn = !isEnglish && geminiAdvice ? geminiAdvice : advice.adviceKn
    const finalAdviceEn = isEnglish && geminiAdvice ? geminiAdvice : advice.adviceEn

    if (dbBacked && farmer.id) {
      const farmerId = farmer.id
      await withDbRetry(async () => {
        await prisma.farmerInteraction.create({
          data: {
            farmerId,
            cropFieldId: field.id,
            inputType: "TEXT",
            language,
            transcriptText: text,
            aiResponseText: isEnglish ? finalAdviceEn : finalAdviceKn,
          },
        })
        await prisma.cropField.update({
          where: { id: field.id },
          data: { latestFarmerNote: text },
        })
      }, "logTextObservation").catch((dbErr) =>
        console.warn("⚠️ [CropStage Text Log Warning]:", dbErr?.message || dbErr)
      )
    } else {
      const fb = getOrCreateFallbackFarmer(mobile)
      const fbField = fb.activeCrops?.find((f: any) => f.id === field.id) || fb.activeCrops?.[0]
      if (fbField) fbField.latestFarmerNote = text
      cacheFallbackFarmer(fb)
    }

    return res.json({
      success: true,
      query: text,
      cropName,
      presentStage: stageDef.nameKn,
      presentStageEn: stageDef.nameEn,
      daysSinceSowing,
      adviceKn: finalAdviceKn,
      adviceEn: finalAdviceEn,
      urgency: advice.urgency,
    })
  } catch (error) {
    console.error("❌ [CropStage Text Handler Error]:", error)
    return res.status(500).json({
      success: false,
      message: "Error processing text input",
      error: error instanceof Error ? error.message : "Internal Error",
    })
  }
}

