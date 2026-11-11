// ==============================================================================
// Pest Detection Service
// Runs YOLO11s TFLite model via Python subprocess for crop pest inference.
// After detection, optionally calls Gemini for detailed bilingual remedies.
// ==============================================================================

import { execFile } from "child_process"
import path from "path"
import fs from "fs"
import { getAgriAdvisory } from "./gemini.service.js"

const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts")
const INFER_SCRIPT = path.join(SCRIPTS_DIR, "infer_pest.py")

export interface PestDetection {
  class_id: number
  class_name: string
  confidence: number
  bbox: number[]
}

export interface PestInferenceResult {
  success: boolean
  detections: PestDetection[]
  primary: {
    pest_name: string
    confidence: number
    class_id: number
  } | null
  total_pests_found: number
  error?: string
  message?: string
}

export interface DiagnosisResult {
  success: boolean
  pest_name: string
  confidence: number
  total_pests_found: number
  all_detections: PestDetection[]
  severity: string
  about: string
  symptoms: string[]
  chemical: string[]
  organic: string[]
  prevention: string[]
  gemini_used: boolean
  error?: string
}

/**
 * Run YOLO TFLite inference on an uploaded image via Python subprocess.
 */
export function runPestInference(imagePath: string): Promise<PestInferenceResult> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(imagePath)) {
      return resolve({
        success: false,
        detections: [],
        primary: null,
        total_pests_found: 0,
        error: `Image file not found: ${imagePath}`,
      })
    }

    execFile(
      "python",
      [INFER_SCRIPT, imagePath],
      { timeout: 30000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ [Pest Inference Error]:`, error.message)
          if (stderr) console.error(`   stderr: ${stderr}`)
          return resolve({
            success: false,
            detections: [],
            primary: null,
            total_pests_found: 0,
            error: `Inference failed: ${error.message}`,
          })
        }

        try {
          // Parse the JSON string from stdout (ignoring warning lines if any)
          const lines = stdout.trim().split("\n")
          const jsonLine = lines.find((l) => l.trim().startsWith("{")) || stdout.trim()
          const result = JSON.parse(jsonLine)
          resolve(result)
        } catch (parseErr) {
          console.error(`❌ [Pest Inference Parse Error]:`, stdout)
          resolve({
            success: false,
            detections: [],
            primary: null,
            total_pests_found: 0,
            error: `Failed to parse inference output`,
          })
        }
      }
    )
  })
}

/**
 * Determine severity based on confidence and number of detections.
 */
function assessSeverity(confidence: number, totalPests: number): string {
  if (totalPests >= 4 || confidence >= 85) return "High"
  if (totalPests >= 2 || confidence >= 60) return "Moderate"
  return "Low"
}

// Fallback remedy database for top pests (when Gemini is unavailable)
const FALLBACK_REMEDIES: Record<string, Partial<DiagnosisResult>> = {
  aphids: {
    about:
      "Aphids are small soft-bodied insects that suck plant sap, causing curling leaves, stunted growth, and honeydew secretion that attracts sooty mold.",
    symptoms: [
      "Curling and yellowing of leaves",
      "Sticky honeydew on leaf surfaces",
      "Stunted plant growth",
      "Presence of ants farming aphids",
    ],
    chemical: [
      "Imidacloprid 17.8% SL @ 0.3 ml/L water",
      "Thiamethoxam 25% WG @ 0.3 g/L water",
      "Dimethoate 30% EC @ 1.5 ml/L water",
    ],
    organic: [
      "Neem oil 5 ml/L + liquid soap as foliar spray",
      "Yellow sticky traps for monitoring",
      "Release ladybird beetles (natural predator)",
    ],
    prevention: [
      "Avoid excess nitrogen fertilizer",
      "Regular field monitoring every 3-5 days",
      "Maintain proper plant spacing for air circulation",
    ],
  },
  "army worm": {
    about:
      "Army worms are destructive caterpillar larvae that march in large groups consuming entire crop fields, especially cereals and grasses.",
    symptoms: [
      "Ragged, chewed leaf edges",
      "Skeletonized leaves (only veins remaining)",
      "Larvae visible during early morning or evening",
      "Frass (droppings) on leaves and ground",
    ],
    chemical: [
      "Chlorantraniliprole 18.5% SC @ 0.3 ml/L water",
      "Emamectin benzoate 5% SG @ 0.4 g/L water",
      "Lambda-cyhalothrin 5% EC @ 1 ml/L water",
    ],
    organic: [
      "Bt (Bacillus thuringiensis) spray @ 2 g/L water",
      "Neem seed kernel extract 5% spray",
      "Bird perches in field for natural predation",
    ],
    prevention: [
      "Deep ploughing to expose pupae",
      "Light traps to monitor adult moths",
      "Early sowing to avoid peak infestation period",
    ],
  },
}

/**
 * Get Gemini-powered detailed pest diagnosis with bilingual remedies.
 * Falls back to stored remedies if Gemini is unavailable.
 */
export async function getDetailedDiagnosis(
  pestName: string,
  confidence: number,
  totalPests: number,
  allDetections: PestDetection[]
): Promise<DiagnosisResult> {
  const severity = assessSeverity(confidence, totalPests)

  // Try Gemini first for rich, detailed advice
  try {
    const prompt = `A farmer's crop has been scanned and detected: "${pestName}" pest/insect with ${confidence}% confidence. ${totalPests} pest(s) detected total.

Please provide a structured diagnosis report in this EXACT JSON format (respond ONLY with valid JSON, no markdown):
{
  "about": "2-3 sentence description of this pest, its lifecycle, and damage pattern",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
  "chemical": ["Chemical treatment 1 with exact dosage per liter", "Chemical treatment 2 with dosage", "Chemical treatment 3 with dosage"],
  "organic": ["Organic remedy 1 with dosage", "Organic remedy 2", "Organic remedy 3"],
  "prevention": ["Prevention measure 1", "Prevention measure 2", "Prevention measure 3"]
}

Important: Include exact dosages (g/L or ml/L). Mention both brand-name pesticides and generic active ingredients. Focus on Indian agriculture context and locally available products.`

    const geminiResponse = await getAgriAdvisory(prompt)

    // Parse JSON from Gemini response
    const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        success: true,
        pest_name: pestName,
        confidence,
        total_pests_found: totalPests,
        all_detections: allDetections,
        severity,
        about: parsed.about || `${pestName} detected with ${confidence}% confidence.`,
        symptoms: parsed.symptoms || [],
        chemical: parsed.chemical || [],
        organic: parsed.organic || [],
        prevention: parsed.prevention || [],
        gemini_used: true,
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [Pest Diagnosis] Gemini unavailable, using fallback: ${err?.message}`)
  }

  // Fallback to stored remedies
  const key = pestName.toLowerCase()
  const fallback = FALLBACK_REMEDIES[key] || {}

  return {
    success: true,
    pest_name: pestName,
    confidence,
    total_pests_found: totalPests,
    all_detections: allDetections,
    severity,
    about: fallback.about || `${pestName} pest detected with ${confidence}% confidence. This pest can cause significant crop damage if not controlled promptly.`,
    symptoms: fallback.symptoms || [
      "Visible pest damage on leaves and stems",
      "Discoloration or wilting of affected plant parts",
      "Reduced crop vigor and growth",
    ],
    chemical: fallback.chemical || [
      "Consult your local KVK or agricultural officer for specific pesticide recommendations",
      "Use IPM (Integrated Pest Management) approach",
    ],
    organic: fallback.organic || [
      "Neem oil spray (5 ml/L water) as first line of defense",
      "Manually remove visible pests",
      "Encourage natural predators in the field",
    ],
    prevention: fallback.prevention || [
      "Regular field scouting every 3-5 days",
      "Crop rotation with non-host crops",
      "Maintain field hygiene — remove crop residues",
    ],
    gemini_used: false,
  }
}

