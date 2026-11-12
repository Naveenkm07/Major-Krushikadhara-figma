// ==============================================================================
// AI Advisor Controller
// Handles voice-to-text (Sarvam AI Saaras:v4) and agricultural streaming (Gemini 2.5 Flash)
// ==============================================================================

import type { Request, Response } from "express"
import { transcribeAudioWithSarvam } from "../services/sarvam.service.js"
import { streamAgriAdvisory, getAgriAdvisory, type AgriChatContext } from "../services/gemini.service.js"
import { getCropGrowthStage, generateStageAwareAdvice } from "../services/stageAdvisory.service.js"
import { prisma, withDbRetry } from "../config/db.js"

async function resolveFarmerContext(params: {
  mobile?: string
  cropName?: string
  district?: string
  language?: string
}): Promise<{ context: AgriChatContext; farmerId?: string; cropFieldId?: string; daysSinceSowing: number }> {
  const isEnglish = params.language ? params.language.toLowerCase().startsWith("en") : undefined
  const context: AgriChatContext = {
    cropName: params.cropName,
    district: params.district,
    preferredLanguage: isEnglish === undefined ? undefined : isEnglish ? "en" : "kn",
  }

  let farmerId: string | undefined
  let cropFieldId: string | undefined
  let daysSinceSowing = 35

  if (params.mobile) {
    const mobile = params.mobile
    const farmer = await withDbRetry(
      () =>
        prisma.farmer.findUnique({
          where: { mobile },
          include: { activeCrops: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      "AI resolveFarmerContext"
    ).catch((err) => {
      console.warn("⚠️ [AI Context DB Warning]:", err?.message || err)
      return null
    })

    if (farmer) {
      farmerId = farmer.id
      if (!context.district) context.district = farmer.district
      const crop = farmer.activeCrops[0]
      if (crop) {
        cropFieldId = crop.id
        daysSinceSowing = Math.max(1, Math.floor((Date.now() - new Date(crop.sowingDate).getTime()) / 86400000))
        if (!context.cropName) context.cropName = crop.cropName
        context.growthStage = crop.currentStage
        context.daysSinceSowing = daysSinceSowing
      }
    }
  }

  return { context, farmerId, cropFieldId, daysSinceSowing }
}

function buildStageFallbackText(query: string, context: AgriChatContext, daysSinceSowing: number): string {
  const cropName = context.cropName || "Rice (Paddy)"
  const stageDef = getCropGrowthStage(cropName, daysSinceSowing)
  const advice = generateStageAwareAdvice({
    cropName,
    currentStage: stageDef,
    daysSinceSowing,
    farmerQuery: query,
    language: context.preferredLanguage,
  })
  return context.preferredLanguage === "en" ? advice.adviceEn : advice.adviceKn
}

/**
 * POST /api/ai/ask-stream
 * Server-Sent Events (SSE) streaming endpoint for agricultural queries.
 * Receives JSON: { query: string, mobile?: string, cropName?: string, district?: string, language?: string }
 */
export async function streamAgriChat(req: Request, res: Response): Promise<void> {
  const { query, mobile, cropName, district, language } = req.body

  if (!query || typeof query !== "string") {
    res.status(400).json({ success: false, error: "Query is required" })
    return
  }

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders?.()

  try {
    const { context, daysSinceSowing } = await resolveFarmerContext({
      mobile,
      cropName,
      district,
      language,
    })

    try {
      await streamAgriAdvisory(query, context, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
      })
    } catch (geminiErr: any) {
      console.warn("⚠️ [Gemini Stream Fallback to Stage Engine]:", geminiErr?.message || geminiErr)
      const fallbackText = buildStageFallbackText(query, context, daysSinceSowing)
      res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`)
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err: any) {
    console.error("❌ [Gemini Stream Error]:", err?.message || err)
    res.write(`data: ${JSON.stringify({ error: err?.message || "Failed to generate AI response" })}\n\n`)
    res.end()
  }
}

/**
 * POST /api/ai/voice-stream
 * Receives multipart audio file -> Sarvam STT -> Streams Gemini agricultural advisory.
 */
export async function handleVoiceStream(req: Request, res: Response): Promise<void> {
  const file = req.file
  const mobile = (req.body?.mobile as string) || "9591502209"
  const lang = (req.body?.language as string) || "kn-IN"
  const cropNameBody = req.body?.cropName as string | undefined
  const districtBody = req.body?.district as string | undefined

  if (!file) {
    res.status(400).json({ success: false, error: "Audio file is required" })
    return
  }

  try {
    // 1. Convert Voice Audio to Text via Sarvam STT
    const stt = await transcribeAudioWithSarvam(file.buffer, file.originalname, lang)
    if (!stt.success || !stt.transcript.trim()) {
      res.status(400).json({
        success: false,
        error: stt.error || "Could not transcribe audio. Please speak clearly.",
      })
      return
    }

    // Set SSE Headers for streaming the response
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.flushHeaders?.()

    // Send the transcribed text first
    res.write(`data: ${JSON.stringify({ transcript: stt.transcript, language: stt.languageCode })}\n\n`)

    // 2. Fetch context from DB
    const { context, farmerId, cropFieldId, daysSinceSowing } = await resolveFarmerContext({
      mobile,
      cropName: cropNameBody,
      district: districtBody,
      language: stt.languageCode || lang,
    })

    // 3. Stream Gemini response (or rule-engine fallback if Gemini is rate-limited/unavailable)
    let fullResponse = ""
    try {
      await streamAgriAdvisory(stt.transcript, context, (chunk) => {
        fullResponse += chunk
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
      })
    } catch (geminiErr: any) {
      console.warn("⚠️ [Voice Stream Fallback to Stage Engine]:", geminiErr?.message || geminiErr)
      fullResponse = buildStageFallbackText(stt.transcript, context, daysSinceSowing)
      res.write(`data: ${JSON.stringify({ chunk: fullResponse })}\n\n`)
    }

    // Log to Neon DB
    if (farmerId) {
      await prisma.farmerInteraction
        .create({
          data: {
            farmerId,
            cropFieldId,
            inputType: "VOICE",
            language: stt.languageCode,
            transcriptText: stt.transcript,
            aiResponseText: fullResponse,
          },
        })
        .catch(() => {})
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err: any) {
    console.error("❌ [Voice Stream Handler Error]:", err?.message || err)
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err?.message || "Failed to process audio" })
      return
    }
    res.write(`data: ${JSON.stringify({ error: err?.message || "Failed to process audio" })}\n\n`)
    res.end()
  }
}

/**
 * POST /api/ai/ask (Non-streaming fallback)
 */
export async function askAgriAdvisor(req: Request, res: Response): Promise<void> {
  try {
    const { query, mobile, cropName, district, language } = req.body
    if (!query || typeof query !== "string") {
      res.status(400).json({ success: false, error: "Query is required" })
      return
    }

    const { context, daysSinceSowing } = await resolveFarmerContext({
      mobile,
      cropName,
      district,
      language,
    })

    try {
      const answer = await getAgriAdvisory(query, context)
      res.json({ success: true, answer })
    } catch (geminiErr: any) {
      console.warn("⚠️ [askAgriAdvisor Fallback]:", geminiErr?.message || geminiErr)
      const fallbackText = buildStageFallbackText(query, context, daysSinceSowing)
      res.json({ success: true, answer: fallbackText, fallback: true })
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Internal server error" })
  }
}

