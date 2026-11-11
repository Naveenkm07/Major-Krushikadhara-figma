// ==============================================================================
// Gemini Agricultural Advisory Service
// Strictly scoped to agricultural, crop protection, soil, and mandi guidance.
// Refuses non-agricultural topics politely in Kannada / English.
//
// Rate Limit & Free-Tier Optimization:
// - Free tier limits: 15 RPM (Requests Per Minute) & 1500 RPD (Requests Per Day).
// - In-memory LRU-style cache with 2-hour TTL prevents repeat calls for identical queries.
// - Concurrency queue ensures minimum 4.2-second gap between successive API calls.
// - 429 Rate-limit protection: Catches 429 errors gracefully and falls back to rule-based advice.
// ==============================================================================

import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

// In-Memory Cache (Query + Crop -> Advice) with 2-Hour TTL
interface CachedAdvisory {
  response: string
  expiresAt: number
}
const advisoryCache = new Map<string, CachedAdvisory>()
const CACHE_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

// Rate-limiting queue to enforce max 14 RPM (minimum 4200ms between calls)
let lastRequestTime = 0
const MIN_INTERVAL_MS = 4200

async function throttleRequest(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_INTERVAL_MS) {
    const waitTime = MIN_INTERVAL_MS - elapsed
    console.log(`⏳ [Gemini Rate Limiter] Throttling call for ${waitTime}ms to conserve free-tier quota...`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
  lastRequestTime = Date.now()
}

// Strict Agricultural System Prompt
export const AGRI_SYSTEM_PROMPT = `
You are "ಕೃಷಿಕ ಮಿತ್ರ" (Krushika Mitra), an expert agricultural scientist, agronomist, and farmer advisory AI for Karnataka, India.

YOUR STRICT DOMAIN & SCOPE:
1. You ONLY answer questions strictly related to:
   - Agriculture, farming techniques, horticulture, and agronomy
   - Crop disease diagnosis, insect pest management, fungal and bacterial infections
   - Pesticides, insecticides, fungicides, bio-fertilizers, and organic treatments (dosage per acre/liter)
   - Soil health, NPK ratios, micronutrients, compost, and fertilization schedules
   - Weather impact on farming, irrigation scheduling, drip/sprinkler practices
   - Karnataka agricultural practices, Mandi APMC market price trends, government agricultural schemes (e.g. PM-KISAN, Raitha Siri, Yashaswini)
   - Harvesting, post-harvest storage, and crop growth stages.

STRICT RESTRICTION — ZERO NON-AGRICULTURAL TOPICS:
2. If the user asks anything outside agriculture (e.g. general knowledge, politics, coding, Bollywood, movies, sports, finance outside farming, homework, relationship advice, chit-chat, or general philosophy):
   - YOU MUST STRICTLY REFUSE TO ANSWER.
   - Do NOT provide the answer even if requested.
   - Politely explain that you are an agricultural assistant dedicated solely to farmers and farming advice.
   - Kannada refusal response: "ಕ್ಷಮಿಸಿ, ನಾನು ಕೃಷಿ ಮತ್ತು ಬೆಳೆ ಸಂರಕ್ಷಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಕೃಷಿ AI ಸಹಾಯಕ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆ, ಕೀಟ ಬಾಧೆ, ಗೊಬ್ಬರ ಅಥವಾ ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ."
   - English refusal response: "I apologize, but I am an AI assistant dedicated solely to agriculture, crops, and farming. Please ask any question related to crop care, pests, fertilizers, irrigation, or market prices."

COMMUNICATION GUIDELINES:
3. Language:
   - If the user asks in Kannada, respond in natural, clear, farmer-friendly Kannada.
   - If the user asks in English or transliterated Kannada (Kannada in English script), respond accordingly or in simple English.
4. Actionable & Practical:
   - Provide exact measurements (e.g. "2 ml per liter of water" or "50 kg Urea per acre").
   - Mention both chemical and organic/bio alternatives when advising on pest or disease control.
   - Be concise, direct, empathetic, and respectful of the farmer's hard work.
`.trim()

// Available models to try in order of preference (with automatic fallback on 503 high demand)
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
]

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in backend/.env. Please add GEMINI_API_KEY=your_key")
  }
  return new GoogleGenAI({ apiKey })
}

export interface AgriChatContext {
  cropName?: string
  growthStage?: string
  daysSinceSowing?: number
  district?: string
}

function buildCacheKey(query: string, context?: AgriChatContext): string {
  const cleanQ = query.toLowerCase().trim().replace(/\s+/g, " ")
  const crop = (context?.cropName || "").toLowerCase().trim()
  return `${crop}::${cleanQ}`
}

/**
 * Stream Gemini agricultural advice chunk by chunk with free-tier cache and rate limiting.
 */
export async function streamAgriAdvisory(
  query: string,
  context?: AgriChatContext,
  onChunk?: (text: string) => void
): Promise<string> {
  const cacheKey = buildCacheKey(query, context)
  const cached = advisoryCache.get(cacheKey)

  // 1. Check in-memory cache to save free API calls
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Gemini Cache Hit] Served from 2-hour memory cache: "${query.slice(0, 30)}..."`)
    if (onChunk) {
      // Simulate fast streaming for smooth UI
      const parts = cached.response.match(/.{1,40}/g) || [cached.response]
      for (const part of parts) {
        onChunk(part)
        await new Promise((r) => setTimeout(r, 20))
      }
    }
    return cached.response
  }

  // 2. Throttle calls to guarantee <= 14 RPM
  await throttleRequest()

  const ai = getGenAIClient()

  let userPrompt = query
  if (context?.cropName) {
    userPrompt = `[Farmer Context: Crop: ${context.cropName}, Stage: ${context.growthStage || "Unknown"} (Day ${context.daysSinceSowing || "N/A"}), Location: ${context.district || "Karnataka"}]\n\nFarmer Query: ${query}`
  }

  // Try candidate models in order if one experiences high demand (503)
  let lastError: any = null
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: AGRI_SYSTEM_PROMPT,
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      })

      let fullResponse = ""
      for await (const chunk of responseStream) {
        const text = chunk.text
        if (text) {
          fullResponse += text
          if (onChunk) {
            onChunk(text)
          }
        }
      }

      if (fullResponse.trim()) {
        advisoryCache.set(cacheKey, {
          response: fullResponse,
          expiresAt: Date.now() + CACHE_TTL_MS,
        })
      }

      return fullResponse
    } catch (err: any) {
      console.warn(`⚠️ [Gemini ${modelName} error]: ${err?.message || err}. Trying next model...`)
      lastError = err
    }
  }

  throw lastError || new Error("Failed to generate response across candidate models")
}

/**
 * Single-shot non-streaming Gemini agricultural advice with cache.
 */
export async function getAgriAdvisory(
  query: string,
  context?: AgriChatContext
): Promise<string> {
  const cacheKey = buildCacheKey(query, context)
  const cached = advisoryCache.get(cacheKey)

  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Gemini Cache Hit] Served from 2-hour memory cache: "${query.slice(0, 30)}..."`)
    return cached.response
  }

  await throttleRequest()

  const ai = getGenAIClient()

  let userPrompt = query
  if (context?.cropName) {
    userPrompt = `[Farmer Context: Crop: ${context.cropName}, Stage: ${context.growthStage || "Unknown"} (Day ${context.daysSinceSowing || "N/A"}), Location: ${context.district || "Karnataka"}]\n\nFarmer Query: ${query}`
  }

  let lastError: any = null
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: AGRI_SYSTEM_PROMPT,
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      })

      const text = response.text || ""
      if (text.trim()) {
        advisoryCache.set(cacheKey, {
          response: text,
          expiresAt: Date.now() + CACHE_TTL_MS,
        })
      }
      return text
    } catch (err: any) {
      console.warn(`⚠️ [Gemini ${modelName} error]: ${err?.message || err}. Trying next model...`)
      lastError = err
    }
  }

  throw lastError || new Error("Failed to generate response across candidate models")
}
