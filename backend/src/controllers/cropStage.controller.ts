import type { Request, Response } from "express"
import { prisma } from "../config/db.js"
import {
  getCropGrowthStage,
  generateStageAwareAdvice,
  CROP_STAGE_DEFINITIONS,
} from "../services/stageAdvisory.service.js"
import { transcribeAudioWithSarvam } from "../services/sarvam.service.js"
import { getAgriAdvisory } from "../services/gemini.service.js"

/**
 * GET /api/crop-stage/active
 * Returns the farmer's active crop field, calculated growth stage, and tailored advisories.
 */
export async function getActiveCropStage(req: Request, res: Response) {
  try {
    const mobile = (req.query.mobile as string) || "9591502209"

    // Find farmer or default demo farmer in Neon PostgreSQL
    let farmer = await prisma.farmer.findUnique({
      where: { mobile },
      include: {
        activeCrops: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!farmer) {
      // Create farmer record if not yet created
      farmer = await prisma.farmer.create({
        data: {
          mobile,
          name: "Naveen Kumar KM",
          district: "Mandya",
          state: "Karnataka",
          taluk: "Pandavapura",
          village: "Channasandra",
          farmSize: 4.2,
          experienceYears: 6,
        },
        include: {
          activeCrops: true,
        },
      })
    }

    let activeField = farmer.activeCrops[0]

    // If farmer has no active crop field yet, create one (e.g. Rice transplanted 35 days ago)
    if (!activeField) {
      const sowingDate = new Date()
      sowingDate.setDate(sowingDate.getDate() - 35) // 35 days ago (Tillering / Vegetative stage)

      activeField = await prisma.cropField.create({
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
    }

    // Calculate days since sowing
    const now = new Date()
    const diffMs = now.getTime() - new Date(activeField.sowingDate).getTime()
    const daysSinceSowing = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

    // Calculate present stage and advisories dynamically
    const stageDef = getCropGrowthStage(activeField.cropName, daysSinceSowing)

    return res.json({
      success: true,
      farmer: {
        name: farmer.name,
        nameKn: farmer.name,
        district: farmer.district,
      },
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
      allStages: (CROP_STAGE_DEFINITIONS.rice || []).map((s) => ({
        key: s.key,
        nameEn: s.nameEn,
        nameKn: s.nameKn,
        startDay: s.startDay,
        endDay: s.endDay,
        isCurrent: s.key === stageDef.key,
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
 * PUT /api/crop-stage/:fieldId/stage
 * Manually update crop stage or sowing date
 */
export async function updateCropStage(req: Request, res: Response) {
  try {
    const { fieldId } = req.params
    const { stageKey, healthStatus, latestNote } = req.body

    const updated = await prisma.cropField.update({
      where: { id: fieldId },
      data: {
        currentStage: stageKey,
        healthStatus: healthStatus || undefined,
        latestFarmerNote: latestNote || undefined,
      },
    })

    return res.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error("❌ [CropStage Controller] Update Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update crop stage",
      error: error instanceof Error ? error.message : "Internal Error",
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
    const mobile = (req.body.mobile as string) || "9591502209"
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

    // 2. Load farmer's active crop field
    const farmer = await prisma.farmer.findUnique({
      where: { mobile },
      include: {
        activeCrops: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    const field = farmer?.activeCrops[0]
    const cropName = field?.cropName || "Rice (Paddy)"
    const daysSinceSowing = field ? Math.max(1, Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / 86400000)) : 35
    const stageDef = getCropGrowthStage(cropName, daysSinceSowing)

    // 3. Generate agronomy advice tailored to this exact present stage
    // Attempt real-time Gemini advisory with strict agricultural prompt; fallback to rule engine
    let geminiAdvice = ""
    try {
      geminiAdvice = await getAgriAdvisory(transcript, {
        cropName,
        growthStage: stageDef.nameKn + " (" + stageDef.nameEn + ")",
        daysSinceSowing,
        district: farmer?.district || "Karnataka",
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

    const finalAdviceKn = geminiAdvice || advice.adviceKn
    const finalAdviceEn = geminiAdvice || advice.adviceEn

    // 4. Log interaction in Neon PostgreSQL
    if (farmer) {
      await prisma.farmerInteraction.create({
        data: {
          farmerId: farmer.id,
          cropFieldId: field?.id,
          inputType: "VOICE",
          language: sttResult.languageCode,
          transcriptText: transcript,
          aiResponseText: finalAdviceKn,
        },
      })

      // Update latest farmer note on crop field
      if (field) {
        await prisma.cropField.update({
          where: { id: field.id },
          data: {
            latestFarmerNote: transcript,
          },
        })
      }
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
    const { text, mobile = "9591502209", language = "kn" } = req.body

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text query is required",
      })
    }

    const farmer = await prisma.farmer.findUnique({
      where: { mobile },
      include: {
        activeCrops: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    const field = farmer?.activeCrops[0]
    const cropName = field?.cropName || "Rice (Paddy)"
    const daysSinceSowing = field ? Math.max(1, Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / 86400000)) : 35
    const stageDef = getCropGrowthStage(cropName, daysSinceSowing)

    let geminiAdvice = ""
    try {
      geminiAdvice = await getAgriAdvisory(text, {
        cropName,
        growthStage: stageDef.nameKn + " (" + stageDef.nameEn + ")",
        daysSinceSowing,
        district: farmer?.district || "Karnataka",
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

    const finalAdviceKn = geminiAdvice || advice.adviceKn
    const finalAdviceEn = geminiAdvice || advice.adviceEn

    if (farmer) {
      await prisma.farmerInteraction.create({
        data: {
          farmerId: farmer.id,
          cropFieldId: field?.id,
          inputType: "TEXT",
          language,
          transcriptText: text,
          aiResponseText: finalAdviceKn,
        },
      })

      if (field) {
        await prisma.cropField.update({
          where: { id: field.id },
          data: {
            latestFarmerNote: text,
          },
        })
      }
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

