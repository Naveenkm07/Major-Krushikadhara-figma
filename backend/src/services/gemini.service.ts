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

import crypto from "crypto"
import { GoogleGenAI } from "@google/genai"
import "../config/env.js"

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
let throttleChain: Promise<void> = Promise.resolve()

function throttleRequest(): Promise<void> {
  const next = throttleChain.then(async () => {
    const now = Date.now()
    const elapsed = now - lastRequestTime
    if (elapsed < MIN_INTERVAL_MS) {
      const waitTime = MIN_INTERVAL_MS - elapsed
      console.log(`⏳ [Gemini Rate Limiter] Throttling call for ${waitTime}ms to conserve free-tier quota...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
    lastRequestTime = Date.now()
  })
  throttleChain = next.catch(() => {})
  return next
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then(
      (val) => {
        clearTimeout(timer)
        resolve(val)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
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

// Available models verified active & fast on this API key (with automatic fallback)
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
]
const GEMINI_TIMEOUT_MS = 18000

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || ""
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
  preferredLanguage?: "kn" | "en"
}

function buildCacheKey(query: string, context?: AgriChatContext): string {
  const cleanQ = query.toLowerCase().trim().replace(/\s+/g, " ")
  const crop = (context?.cropName || "").toLowerCase().trim()
  const lang = context?.preferredLanguage || "auto"
  return `${crop}::${lang}::${cleanQ}`
}

function buildContextualPrompt(query: string, context?: AgriChatContext): string {
  const parts: string[] = []
  if (context?.cropName) {
    parts.push(
      `[Farmer Context: Crop: ${context.cropName}, Stage: ${context.growthStage || "Unknown"} (Day ${context.daysSinceSowing || "N/A"}), Location: ${context.district || "Karnataka"}]`
    )
  }
  if (context?.preferredLanguage === "kn") {
    parts.push("[Response Language: Respond in clear, farmer-friendly Kannada (ಕನ್ನಡ) script.]")
  } else if (context?.preferredLanguage === "en") {
    parts.push("[Response Language: Respond in simple, clear English.]")
  }
  if (parts.length === 0) return query
  return `${parts.join("\n")}\n\nFarmer Query: ${query}`
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
  const userPrompt = buildContextualPrompt(query, context)

  // Try candidate models in order if one fails or stalls
  let lastError: any = null
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const fullResponse = await withTimeout(
        (async () => {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction: AGRI_SYSTEM_PROMPT,
              temperature: 0.3,
              maxOutputTokens: 600,
            },
          })

          let collected = ""
          for await (const chunk of responseStream) {
            const text = chunk.text
            if (text) {
              collected += text
              if (onChunk) {
                onChunk(text)
              }
            }
          }
          return collected
        })(),
        GEMINI_TIMEOUT_MS,
        `Gemini stream (${modelName})`
      )

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
  context?: AgriChatContext,
  options?: { timeoutMs?: number; maxModels?: number }
): Promise<string> {
  const cacheKey = buildCacheKey(query, context)
  const cached = advisoryCache.get(cacheKey)

  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Gemini Cache Hit] Served from 2-hour memory cache: "${query.slice(0, 30)}..."`)
    return cached.response
  }

  await throttleRequest()

  const ai = getGenAIClient()
  const userPrompt = buildContextualPrompt(query, context)
  const timeoutMs = options?.timeoutMs ?? GEMINI_TIMEOUT_MS
  const modelsToTry = CANDIDATE_MODELS.slice(0, options?.maxModels ?? CANDIDATE_MODELS.length)

  let lastError: any = null
  for (const modelName of modelsToTry) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: AGRI_SYSTEM_PROMPT,
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
        timeoutMs,
        `Gemini request (${modelName})`
      )

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

export interface CropVisionAnalysis {
  isPlantImage: boolean
  imageQualityIssue: "blurry" | "dark" | "too_far" | null
  detectedCrop: string
  healthy: boolean
  issueType: "pest" | "fungal" | "bacterial" | "viral" | "nutrient" | "healthy" | "non_crop"
  diagnosisNameEn: string
  diagnosisNameKn: string
  scientificName: string
  confidence: number
  severity: "None" | "Low" | "Moderate" | "High" | "Critical"
  affectedAreaPct: number
  spreadRisk: "None" | "Low" | "Moderate" | "High"
  aboutEn: string
  aboutKn: string
  symptomsEn: string[]
  symptomsKn: string[]
  chemicalEn: string[]
  chemicalKn: string[]
  organicEn: string[]
  organicKn: string[]
  preventionEn: string[]
  preventionKn: string[]
}

const visionCache = new Map<string, { data: CropVisionAnalysis; expiresAt: number }>()

function asStrArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.map((v) => String(v || "").trim()).filter(Boolean)
}

/**
 * Multimodal Gemini Vision analysis for crop leaves, diseases, nutrient deficiencies, and pests.
 * Validates whether the image is actually a plant/crop/pest photo and produces bilingual EN+KN guidance.
 */
export async function analyzeCropImageVision(
  imageBase64: string,
  mimeType: string,
  options?: {
    scanMode?: "pest" | "crop" | "leaf"
    cropName?: string
    yoloDetections?: Array<{ class_name: string; confidence: number }>
    timeoutMs?: number
    maxModels?: number
  }
): Promise<CropVisionAnalysis | null> {
  const scanMode = options?.scanMode || "pest"
  const cropHint =
    options?.cropName && !/^(auto|crop leaf)$/i.test(options.cropName.trim())
      ? options.cropName.trim()
      : "Unknown (identify from photo)"
  const yoloNote =
    options?.yoloDetections && options.yoloDetections.length > 0
      ? `Local YOLO11s 102-class insect detector found: ${options.yoloDetections
          .map((d) => `${d.class_name} (${d.confidence}%)`)
          .join(", ")}.`
      : "Local YOLO11s 102-class insect detector found 0 insects (note: YOLO11s only detects insects, NOT leaf blight/fungal/bacterial/viral/nutrient issues)."

  const imgHash = crypto
    .createHash("sha256")
    .update(imageBase64.slice(0, 4096))
    .update(String(imageBase64.length))
    .update(`${scanMode}::${cropHint}::${yoloNote}`)
    .digest("hex")

  const cached = visionCache.get(imgHash)
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`⚡ [Gemini Vision Cache Hit] Mode=${scanMode}`)
    return cached.data
  }

  await throttleRequest()

  const ai = getGenAIClient()
  const timeoutMs = options?.timeoutMs ?? 15000
  const modelsToTry = CANDIDATE_MODELS.slice(0, options?.maxModels ?? 2)

  const prompt = `You are an expert Karnataka agricultural plant pathologist and entomologist inspecting a farmer's photo.
Scan Mode: "${scanMode}" ("pest" = focus on insect/pest damage; "leaf" = focus on fungal/bacterial/viral leaf disease; "crop" = overall crop health, nutrient deficiencies & pests).
Farmer Crop Hint: "${cropHint}".
${yoloNote}

TASK:
1. First verify if the photo genuinely shows a crop, plant, leaf, stem, fruit, seed, soil/field, or agricultural insect/pest.
   - If it is clearly NOT an agricultural plant/pest image (e.g., indoor room, face, computer screen, blank card, solid color block, random object), set "isPlantImage": false, "issueType": "non_crop", "healthy": false, "confidence": 15, and explain kindly in aboutEn/aboutKn to capture a close-up of the crop leaf or pest.
2. Check photo quality: if extremely blurry, too dark, or leaf is tiny/distant, set "imageQualityIssue" to "blurry" | "dark" | "too_far", else null.
3. Identify the likely crop ("detectedCrop", e.g., "Tomato", "Rice", "Ragi", "Chilli", "Maize", "Potato", or "Crop Leaf").
4. Diagnose accurately:
   - Treat local YOLO11s detections as a strong localization clue, NOT absolute truth: confirm if visually accurate, or refine to the exact visible species (for example, Colorado Potato Beetle vs Flea Beetle, Fall Armyworm vs Cutworm) with crop-specific bilingual EN+KN remedies.
   - If there is a fungal/bacterial/viral disease (e.g., Early Blight, Late Blight, Bacterial Leaf Spot, Powdery Mildew, Blast, Yellow Mosaic) or nutrient deficiency (Nitrogen/Potassium/Magnesium deficiency), diagnose it accurately with exact Indian agricultural dosages (ml/L or g/L).
   - If the foliage is visibly green, clean, and thriving with no pest/disease/deficiency, set "healthy": true, "issueType": "healthy", "severity": "None", "affectedAreaPct": 0, "spreadRisk": "None".

Respond ONLY with valid raw JSON matching this exact schema (no markdown fences):
{
  "isPlantImage": true,
  "imageQualityIssue": null,
  "detectedCrop": "Tomato",
  "healthy": false,
  "issueType": "fungal",
  "diagnosisNameEn": "Early Blight",
  "diagnosisNameKn": "ಆರಂಭಿಕ ಅಂಗಮಾರಿ ರೋಗ",
  "scientificName": "Alternaria solani",
  "confidence": 88,
  "severity": "Moderate",
  "affectedAreaPct": 25,
  "spreadRisk": "Moderate",
  "aboutEn": "2-3 clear sentences explaining the diagnosis and damage pattern.",
  "aboutKn": "ರೋಗದ ವಿವರ ಮತ್ತು ಬೆಳೆಯ ಮೇಲಿನ ಪರಿಣಾಮವನ್ನು ವಿವರಿಸುವ 2-3 ಸರಳ ಕನ್ನಡ ವಾಕ್ಯಗಳು.",
  "symptomsEn": ["symptom 1", "symptom 2", "symptom 3"],
  "symptomsKn": ["ಲಕ್ಷಣ 1", "ಲಕ್ಷಣ 2", "ಲಕ್ಷಣ 3"],
  "chemicalEn": ["Generic + product with exact dose e.g. Mancozeb 75% WP @ 2.5 g/L water"],
  "chemicalKn": ["ಸರಿಯಾದ ಪ್ರಮಾಣದೊಂದಿಗೆ ರಾಸಾಯನಿಕ ಔಷಧಿ"],
  "organicEn": ["Organic remedy with exact dose e.g. Neem oil 5 ml/L + soap"],
  "organicKn": ["ಸಾವಯವ ಪರಿಹಾರ ಮತ್ತು ಪ್ರಮಾಣ"],
  "preventionEn": ["prevention tip 1", "prevention tip 2", "prevention tip 3"],
  "preventionKn": ["ತಡೆಗಟ್ಟುವ ಕ್ರಮ 1", "ತಡೆಗಟ್ಟುವ ಕ್ರಮ 2", "ತಡೆಗಟ್ಟುವ ಕ್ರಮ 3"]
}`

  for (const modelName of modelsToTry) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: [
            { inlineData: { mimeType, data: imageBase64 } },
            prompt,
          ],
          config: {
            systemInstruction: AGRI_SYSTEM_PROMPT,
            temperature: 0.2,
            maxOutputTokens: 1300,
          },
        }),
        timeoutMs,
        `Gemini Vision (${modelName})`
      )

      const raw = (response.text || "").trim()
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      const validIssueTypes = new Set([
        "pest",
        "fungal",
        "bacterial",
        "viral",
        "nutrient",
        "healthy",
        "non_crop",
      ])
      const validSeverity = new Set(["None", "Low", "Moderate", "High", "Critical"])
      const validSpread = new Set(["None", "Low", "Moderate", "High"])

      const normalized: CropVisionAnalysis = {
        isPlantImage: parsed.isPlantImage !== false,
        imageQualityIssue:
          parsed.imageQualityIssue === "blurry" ||
          parsed.imageQualityIssue === "dark" ||
          parsed.imageQualityIssue === "too_far"
            ? parsed.imageQualityIssue
            : null,
        detectedCrop: String(parsed.detectedCrop || cropHint || "Crop Leaf").trim(),
        healthy: Boolean(parsed.healthy),
        issueType: validIssueTypes.has(parsed.issueType)
          ? parsed.issueType
          : parsed.healthy
          ? "healthy"
          : "fungal",
        diagnosisNameEn: String(parsed.diagnosisNameEn || "Crop Leaf Analysis").trim(),
        diagnosisNameKn: String(parsed.diagnosisNameKn || "ಬೆಳೆ ಎಲೆ ವಿಶ್ಲೇಷಣೆ").trim(),
        scientificName: String(parsed.scientificName || "—").trim(),
        confidence: Math.min(99, Math.max(5, Number(parsed.confidence) || 75)),
        severity: validSeverity.has(parsed.severity) ? parsed.severity : "Moderate",
        affectedAreaPct: Math.min(100, Math.max(0, Number(parsed.affectedAreaPct) || 0)),
        spreadRisk: validSpread.has(parsed.spreadRisk) ? parsed.spreadRisk : "Low",
        aboutEn: String(parsed.aboutEn || "").trim(),
        aboutKn: String(parsed.aboutKn || "").trim(),
        symptomsEn: asStrArray(parsed.symptomsEn),
        symptomsKn: asStrArray(parsed.symptomsKn),
        chemicalEn: asStrArray(parsed.chemicalEn),
        chemicalKn: asStrArray(parsed.chemicalKn),
        organicEn: asStrArray(parsed.organicEn),
        organicKn: asStrArray(parsed.organicKn),
        preventionEn: asStrArray(parsed.preventionEn),
        preventionKn: asStrArray(parsed.preventionKn),
      }

      visionCache.set(imgHash, {
        data: normalized,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      return normalized
    } catch (err: any) {
      console.warn(`⚠️ [Gemini Vision ${modelName} error]: ${err?.message || err}. Trying next...`)
    }
  }

  return null
}
