// ==============================================================================
// AI Advisor Controller
// Handles voice-to-text (Sarvam AI Saaras:v4) and agricultural streaming (Gemini 2.5 Flash)
// ==============================================================================

import type { Request, Response } from "express"
import { transcribeAudioWithSarvam } from "../services/sarvam.service.js"
import { streamAgriAdvisory, getAgriAdvisory } from "../services/gemini.service.js"
import { prisma } from "../config/db.js"

/**
 * POST /api/ai/ask-stream
 * Server-Sent Events (SSE) streaming endpoint for agricultural queries.
 * Receives JSON: { query: string, mobile?: string, cropName?: string, district?: string }
 */
export async function streamAgriChat(req: Request, res: Response): Promise<void> {
  const { query, mobile, cropName, district } = req.body

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
    let context: any = { cropName, district }

    // If mobile is provided, fetch active crop context from Neon DB
    if (mobile) {
      const farmer = await prisma.farmer.findUnique({
        where: { mobile },
        include: { activeCrops: { take: 1, orderBy: { createdAt: "desc" } } },
      })
      if (farmer?.activeCrops[0]) {
        const crop = farmer.activeCrops[0]
        context.cropName = crop.cropName
        context.growthStage = crop.currentStage
        context.district = farmer.district
      }
    }

    // Stream chunks as SSE events
    await streamAgriAdvisory(query, context, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
    })

    // Signal completion
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
    const farmer = await prisma.farmer.findUnique({
      where: { mobile },
      include: { activeCrops: { take: 1, orderBy: { createdAt: "desc" } } },
    })
    const crop = farmer?.activeCrops[0]

    const context = {
      cropName: crop?.cropName,
      growthStage: crop?.currentStage,
      district: farmer?.district || "Karnataka",
    }

    // 3. Stream Gemini response
    let fullResponse = ""
    await streamAgriAdvisory(stt.transcript, context, (chunk) => {
      fullResponse += chunk
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
    })

    // Log to Neon DB
    if (farmer) {
      await prisma.farmerInteraction.create({
        data: {
          farmerId: farmer.id,
          cropFieldId: crop?.id,
          inputType: "VOICE",
          language: stt.languageCode,
          transcriptText: stt.transcript,
          aiResponseText: fullResponse,
        },
      }).catch(() => {})
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err: any) {
    console.error("❌ [Voice Stream Handler Error]:", err?.message || err)
    res.write(`data: ${JSON.stringify({ error: err?.message || "Failed to process audio" })}\n\n`)
    res.end()
  }
}

/**
 * POST /api/ai/ask (Non-streaming fallback)
 */
export async function askAgriAdvisor(req: Request, res: Response): Promise<void> {
  try {
    const { query, mobile, cropName, district } = req.body
    if (!query) {
      res.status(400).json({ success: false, error: "Query is required" })
      return
    }

    const answer = await getAgriAdvisory(query, { cropName, district })
    res.json({ success: true, answer })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Internal server error" })
  }
}

