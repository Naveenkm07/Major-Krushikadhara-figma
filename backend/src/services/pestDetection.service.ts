// ==============================================================================
// Pest Detection Service
// Runs YOLO11s TFLite model via persistent Python worker (fast <300ms inference
// after 1-time interpreter boot) with automatic fallback to single-shot CLI.
// After detection, calls Gemini for detailed remedies with offline fallback.
// ==============================================================================

import { execFile, spawn, type ChildProcessWithoutNullStreams } from "child_process"
import readline from "readline"
import path from "path"
import fs from "fs"
import { analyzeCropImageVision, getAgriAdvisory } from "./gemini.service.js"

const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts")
const INFER_SCRIPT = path.join(SCRIPTS_DIR, "infer_pest.py")
const PYTHON_CMD = process.env.PYTHON_EXECUTABLE || "python"

export interface PestDetection {
  class_id: number
  class_name: string
  confidence: number
  bbox: number[]
  source?: "yolo11s" | "gemini_vision"
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
  mode: "pest" | "crop" | "leaf"
  is_plant: boolean
  low_confidence: boolean
  image_quality_issue: "blurry" | "dark" | "too_far" | null
  detected_crop: string
  scientific_name: string
  issue_type: "pest" | "fungal" | "bacterial" | "viral" | "nutrient" | "healthy" | "non_crop"
  pest_name: string | null
  pest_name_kn: string | null
  confidence: number
  total_pests_found: number
  all_detections: PestDetection[]
  severity: string
  affected_area_pct: number
  spread_risk: string
  healthy: boolean
  message?: string
  message_kn?: string
  about: string
  about_kn: string
  symptoms: string[]
  symptoms_kn: string[]
  chemical: string[]
  chemical_kn: string[]
  organic: string[]
  organic_kn: string[]
  prevention: string[]
  prevention_kn: string[]
  gemini_used: boolean
  yolo_used: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Persistent Python TFLite Worker Management
// ---------------------------------------------------------------------------
interface WorkerState {
  proc: ChildProcessWithoutNullStreams
  readyPromise: Promise<void>
  pendingResolve: ((res: PestInferenceResult) => void) | null
  pendingTimer: NodeJS.Timeout | null
}

let workerState: WorkerState | null = null
let workerQueue: Promise<any> = Promise.resolve()
let cleanupRegistered = false

function resetWorker(errMsg?: string) {
  if (!workerState) return
  const current = workerState
  workerState = null
  if (current.pendingTimer) {
    clearTimeout(current.pendingTimer)
  }
  if (current.pendingResolve) {
    const resolve = current.pendingResolve
    current.pendingResolve = null
    resolve({
      success: false,
      detections: [],
      primary: null,
      total_pests_found: 0,
      error: errMsg || "Pest worker exited unexpectedly",
    })
  }
  try {
    current.proc.kill()
  } catch {}
}

function ensureWorker(): WorkerState {
  if (workerState && !workerState.proc.killed && workerState.proc.exitCode === null) {
    return workerState
  }

  console.log("🧠 [Pest Worker] Booting persistent YOLO11s TFLite Python worker...")
  const proc = spawn(PYTHON_CMD, [INFER_SCRIPT, "--worker"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      TF_CPP_MIN_LOG_LEVEL: "3",
      TF_ENABLE_ONEDNN_OPTS: "0",
      PYTHONIOENCODING: "utf-8",
    },
  })

  let resolveReady!: () => void
  let rejectReady!: (err: Error) => void
  const readyPromise = new Promise<void>((res, rej) => {
    resolveReady = res
    rejectReady = rej
  })
  // Prevent unhandled rejection if caller checks later
  readyPromise.catch(() => {})

  let isReady = false
  const bootTimer = setTimeout(() => {
    if (!isReady) {
      rejectReady(new Error("TFLite worker warm-up timed out after 90s"))
      resetWorker("TFLite worker warm-up timed out")
    }
  }, 90000)

  const state: WorkerState = {
    proc,
    readyPromise,
    pendingResolve: null,
    pendingTimer: null,
  }
  workerState = state

  const rl = readline.createInterface({ input: proc.stdout })
  rl.on("line", (line) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith("{")) return

    try {
      const json = JSON.parse(trimmed)
      if (!isReady && typeof json.ready === "boolean") {
        isReady = true
        clearTimeout(bootTimer)
        if (json.ready) {
          console.log(`✅ [Pest Worker] YOLO11s TFLite model warm and ready (${json.classes || 102} classes).`)
          resolveReady()
        } else {
          rejectReady(new Error(json.error || "Worker failed initialization"))
          resetWorker(json.error || "Worker failed initialization")
        }
        return
      }

      if (state.pendingResolve) {
        if (state.pendingTimer) {
          clearTimeout(state.pendingTimer)
          state.pendingTimer = null
        }
        const resolve = state.pendingResolve
        state.pendingResolve = null
        resolve(json as PestInferenceResult)
      }
    } catch (e) {
      console.warn("⚠️ [Pest Worker] Non-JSON stdout line:", trimmed.slice(0, 120))
    }
  })

  proc.stderr.on("data", (chunk) => {
    const msg = chunk.toString().trim()
    if (msg && !msg.includes("XNNPACK") && !msg.includes("deprecated")) {
      console.warn("[Pest Worker stderr]:", msg)
    }
  })

  proc.on("error", (err) => {
    clearTimeout(bootTimer)
    if (!isReady) rejectReady(err)
    resetWorker(`Worker process error: ${err.message}`)
  })

  proc.on("exit", (code) => {
    clearTimeout(bootTimer)
    if (!isReady) rejectReady(new Error(`Worker exited with code ${code}`))
    if (workerState === state) {
      resetWorker(`Worker exited cleanly/abnormally (code ${code})`)
    }
  })

  if (!cleanupRegistered) {
    cleanupRegistered = true
    process.on("exit", () => resetWorker("Server shutting down"))
  }

  return state
}

/**
 * Optionally pre-warm the TFLite interpreter in background on server startup.
 */
export function warmUpPestDetector(): void {
  try {
    ensureWorker().readyPromise.catch((err) => {
      console.warn("⚠️ [Pest Worker] Background warm-up warning:", err?.message || err)
    })
  } catch (err: any) {
    console.warn("⚠️ [Pest Worker] Failed to start warm-up:", err?.message || err)
  }
}

function runSingleShotFallback(imagePath: string): Promise<PestInferenceResult> {
  return new Promise((resolve) => {
    execFile(
      PYTHON_CMD,
      [INFER_SCRIPT, imagePath],
      {
        timeout: 90000,
        maxBuffer: 2 * 1024 * 1024,
        env: {
          ...process.env,
          TF_CPP_MIN_LOG_LEVEL: "3",
          TF_ENABLE_ONEDNN_OPTS: "0",
          PYTHONIOENCODING: "utf-8",
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ [Pest Inference Fallback Error]:", error.message)
          if (stderr) console.error("   stderr:", stderr)
          return resolve({
            success: false,
            detections: [],
            primary: null,
            total_pests_found: 0,
            error: `Inference failed: ${error.message}`,
          })
        }
        try {
          const lines = stdout.trim().split("\n")
          const jsonLine = [...lines].reverse().find((l) => l.trim().startsWith("{")) || stdout.trim()
          resolve(JSON.parse(jsonLine))
        } catch {
          resolve({
            success: false,
            detections: [],
            primary: null,
            total_pests_found: 0,
            error: "Failed to parse inference output",
          })
        }
      }
    )
  })
}

/**
 * Run YOLO TFLite inference on an uploaded image via warm persistent Python worker.
 */
export function runPestInference(imagePath: string): Promise<PestInferenceResult> {
  if (!fs.existsSync(imagePath)) {
    return Promise.resolve({
      success: false,
      detections: [],
      primary: null,
      total_pests_found: 0,
      error: `Image file not found: ${imagePath}`,
    })
  }

  const job = async (): Promise<PestInferenceResult> => {
    try {
      const worker = ensureWorker()
      await worker.readyPromise

      return await new Promise<PestInferenceResult>((resolve) => {
        worker.pendingResolve = resolve
        worker.pendingTimer = setTimeout(() => {
          if (worker.pendingResolve) {
            worker.pendingResolve = null
            worker.pendingTimer = null
            resetWorker("Inference request timed out after 30s")
            resolve({
              success: false,
              detections: [],
              primary: null,
              total_pests_found: 0,
              error: "Inference timed out after 30s",
            })
          }
        }, 30000)

        worker.proc.stdin.write(JSON.stringify({ imagePath }) + "\n")
      })
    } catch (workerErr: any) {
      console.warn("⚠️ [Pest Inference] Worker failed, falling back to single-shot CLI:", workerErr?.message)
      return await runSingleShotFallback(imagePath)
    }
  }

  const next = workerQueue.then(job, job)
  workerQueue = next.catch(() => {})
  return next
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
    pest_name_kn: "ಹೇನು ಕೀಟ (Aphids)",
    about:
      "Aphids are small soft-bodied insects that suck plant sap, causing curling leaves, stunted growth, and honeydew secretion that attracts sooty mold.",
    about_kn:
      "ಹೇನು ಕೀಟಗಳು ಸಸ್ಯದ ರಸವನ್ನು ಹೀರುವ ಸಣ್ಣ ಮೃದು ದೇಹದ ಕೀಟಗಳಾಗಿವೆ. ಇವುಗಳಿಂದ ಎಲೆಗಳು ಸುರುಳಿಯಾಗುವುದು, ಬೆಳವಣಿಗೆ ಕುಂಠಿತಗೊಳ್ಳುವುದು ಮತ್ತು ಕಪ್ಪು ಬೂಷ್ಟು ಆಕರ್ಷಿಸುವ ಜೇನುತುಪ್ಪದಂತಹ ದ್ರವ ಸ್ರವಿಸುವಿಕೆ ಉಂಟಾಗುತ್ತದೆ.",
    symptoms: [
      "Curling and yellowing of leaves",
      "Sticky honeydew on leaf surfaces",
      "Stunted plant growth",
      "Presence of ants farming aphids",
    ],
    symptoms_kn: [
      "ಎಲೆಗಳು ಸುರುಳಿಯಾಗುವುದು ಮತ್ತು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು",
      "ಎಲೆಗಳ ಮೇಲೆ ಅಂಟಾದ ಜೇನುತುಪ್ಪದಂತಹ ದ್ರವ ಕಾಣಿಸುವುದು",
      "ಸಸ್ಯದ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುವುದು",
      "ಕೀಟಗಳ ಸುತ್ತ ಇರುವೆಗಳ ಓಡಾಟ ಹೆಚ್ಚಾಗುವುದು",
    ],
    chemical: [
      "Imidacloprid 17.8% SL @ 0.3 ml/L water",
      "Thiamethoxam 25% WG @ 0.3 g/L water",
      "Dimethoate 30% EC @ 1.5 ml/L water",
    ],
    chemical_kn: [
      "ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 17.8% SL @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ",
      "ಥಯಾಮೆಥಾಕ್ಸಮ್ 25% WG @ 0.3 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ",
      "ಡೈಮೆಥೋಯೇಟ್ 30% EC @ 1.5 ಮಿ.ಲೀ/ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ",
    ],
    organic: [
      "Neem oil 5 ml/L + liquid soap as foliar spray",
      "Yellow sticky traps for monitoring",
      "Release ladybird beetles (natural predator)",
    ],
    organic_kn: [
      "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ + ದ್ರವ ಸಾಬೂನು ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ",
      "ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು (Yellow sticky traps) ಅಳವಡಿಸಿ",
      "ಗುಲಗಂಜಿ ಹುಳುಗಳಂತಹ (Ladybird beetles) ಮಿತ್ರ ಕೀಟಗಳನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ",
    ],
    prevention: [
      "Avoid excess nitrogen fertilizer",
      "Regular field monitoring every 3-5 days",
      "Maintain proper plant spacing for air circulation",
    ],
    prevention_kn: [
      "ಹೆಚ್ಚುವರಿ ಸಾರಜನಕ (ಯೂರಿಯಾ) ಗೊಬ್ಬರ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ",
      "ಪ್ರತಿ 3-5 ದಿನಗಳಿಗೊಮ್ಮೆ ಬೆಳೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ",
      "ಗಾಳಿ ಸಂಚಾರಕ್ಕಾಗಿ ಗಿಡಗಳ ನಡುವೆ ಸರಿಯಾದ ಅಂತರ ಕಾಯ್ದುಕೊಳ್ಳಿ",
    ],
  },
  "army worm": {
    pest_name_kn: "ಸೈನಿಕ ಹುಳು (Army Worm)",
    about:
      "Army worms are destructive caterpillar larvae that march in large groups consuming entire crop fields, especially cereals and grasses.",
    about_kn:
      "ಸೈನಿಕ ಹುಳುಗಳು (ಕಂಬಳಿ ಹುಳು) ದೊಡ್ಡ ಗುಂಪುಗಳಲ್ಲಿ ಬಂದು ಎಲೆಗಳನ್ನು ತಿಂದು ಬೆಳೆಗಳನ್ನು ನಾಶಪಡಿಸುವ ಹಾನಿಕಾರಕ ಕೀಟಗಳಾಗಿವೆ.",
    symptoms: [
      "Ragged, chewed leaf edges",
      "Skeletonized leaves (only veins remaining)",
      "Larvae visible during early morning or evening",
      "Frass (droppings) on leaves and ground",
    ],
    symptoms_kn: [
      "ಎಲೆಗಳ ಅಂಚುಗಳು ಹರಿದಂತೆ ಕಚ್ಚಲ್ಪಟ್ಟಿರುವುದು",
      "ಎಲೆಗಳ ಹಸಿರು ಭಾಗ ತಿಂದು ಕೇವಲ ನರಗಳು ಮಾತ್ರ ಉಳಿದಿರುವುದು",
      "ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಹುಳುಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುವುದು",
      "ಎಲೆ ಮತ್ತು ನೆಲದ ಮೇಲೆ ಹುಳುಗಳ ಹಿಕ್ಕೆ ಕಂಡುಬರುವುದು",
    ],
    chemical: [
      "Chlorantraniliprole 18.5% SC @ 0.3 ml/L water",
      "Emamectin benzoate 5% SG @ 0.4 g/L water",
      "Lambda-cyhalothrin 5% EC @ 1 ml/L water",
    ],
    chemical_kn: [
      "ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ",
      "ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೇಟ್ 5% SG @ 0.4 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ",
      "ಲ್ಯಾಂಬ್ಡಾ-ಸೈಹಲೋಥ್ರಿನ್ 5% EC @ 1 ಮಿ.ಲೀ/ಲೀಟರ್ ನೀರಿಗೆ ಸಿಂಪಡಿಸಿ",
    ],
    organic: [
      "Bt (Bacillus thuringiensis) spray @ 2 g/L water",
      "Neem seed kernel extract 5% spray",
      "Bird perches in field for natural predation",
    ],
    organic_kn: [
      "Bt (ಬ್ಯಾಸಿಲಸ್ ತುರಿಂಜಿಯೆನ್ಸಿಸ್) @ 2 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ",
      "5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE) ಸಿಂಪಡಿಸಿ",
      "ಪಕ್ಷಿಗಳು ಕೂತು ಹುಳು ತಿನ್ನಲು ಹೊಲದಲ್ಲಿ ಪಕ್ಷಿ ಆಸರೆ ಕಂಬಗಳನ್ನು ನೆಡಿ",
    ],
    prevention: [
      "Deep ploughing to expose pupae",
      "Light traps to monitor adult moths",
      "Early sowing to avoid peak infestation period",
    ],
    prevention_kn: [
      "ಕೋಶಾವಸ್ಥೆಯ ಹುಳುಗಳನ್ನು ನಾಶಪಡಿಸಲು ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳವಾದ ಉಳುಮೆ ಮಾಡಿ",
      "ತಾಯಿ ಪತಂಗಗಳನ್ನು ಹಿಡಿಯಲು ಹೊಲದಲ್ಲಿ ಬೆಳಕಿನ ಬಲೆ (Light trap) ಹಾಕಿ",
      "ಕೀಟ ಬಾಧೆ ಹೆಚ್ಚಾಗುವ ಮುನ್ನವೇ ಸಕಾಲದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ",
    ],
  },
}

/**
 * Get Gemini-powered detailed pest diagnosis with structured remedies.
 * Falls back to stored remedies if Gemini is unavailable.
 */
export async function getDetailedDiagnosis(
  pestName: string,
  confidence: number,
  totalPests: number,
  allDetections: PestDetection[],
  cropName?: string
): Promise<DiagnosisResult> {
  const severity = assessSeverity(confidence, totalPests)
  const cropLabel = cropName && cropName !== "Crop Leaf" ? cropName : "farm crop"

  try {
    const prompt = `A farmer's ${cropLabel} has been scanned and detected: "${pestName}" pest/insect with ${confidence}% confidence. ${totalPests} pest(s) detected total.

Please provide a structured bilingual (English + natural rural Karnataka Kannada) diagnosis report in this EXACT JSON format (respond ONLY with valid JSON, no markdown fences):
{
  "pest_name_kn": "Common Kannada name for ${pestName}",
  "about": "2-3 sentence English description of this pest, its lifecycle, and damage pattern",
  "about_kn": "2-3 sentence natural Kannada explanation of this pest and its damage",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
  "symptoms_kn": ["Kannada symptom 1", "Kannada symptom 2", "Kannada symptom 3", "Kannada symptom 4"],
  "chemical": ["Chemical treatment 1 with exact dosage per liter", "Chemical treatment 2 with dosage", "Chemical treatment 3 with dosage"],
  "chemical_kn": ["Kannada chemical treatment 1 with dosage", "Kannada chemical treatment 2 with dosage", "Kannada chemical treatment 3 with dosage"],
  "organic": ["Organic remedy 1 with dosage", "Organic remedy 2", "Organic remedy 3"],
  "organic_kn": ["Kannada organic remedy 1 with dosage", "Kannada organic remedy 2", "Kannada organic remedy 3"],
  "prevention": ["Prevention measure 1", "Prevention measure 2", "Prevention measure 3"],
  "prevention_kn": ["Kannada prevention 1", "Kannada prevention 2", "Kannada prevention 3"]
}

Important: Include exact dosages (g/L or ml/L). Mention locally available Indian agriculture products and write clear Kannada (ಕನ್ನಡ) in all *_kn fields.`

    const geminiResponse = await getAgriAdvisory(
      prompt,
      {
        cropName: cropName && cropName !== "Crop Leaf" ? cropName : undefined,
        preferredLanguage: "en",
      },
      { timeoutMs: 12000, maxModels: 2 }
    )

    const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const key = pestName.toLowerCase()
      const known = FALLBACK_REMEDIES[key]
      const arr = (v: unknown, fb: string[]): string[] =>
        Array.isArray(v) && v.length > 0 ? v.map((x) => String(x)) : fb

      const symptomsEn = arr(parsed.symptoms, known?.symptoms || [])
      const chemicalEn = arr(parsed.chemical, known?.chemical || [])
      const organicEn = arr(parsed.organic, known?.organic || [])
      const preventionEn = arr(parsed.prevention, known?.prevention || [])

      return {
        success: true,
        mode: "pest",
        is_plant: true,
        low_confidence: confidence < 50,
        image_quality_issue: null,
        detected_crop: cropLabel === "farm crop" ? "Crop Leaf" : cropLabel,
        scientific_name: "—",
        issue_type: "pest",
        pest_name: pestName,
        pest_name_kn: String(parsed.pest_name_kn || known?.pest_name_kn || pestName),
        confidence,
        total_pests_found: totalPests,
        all_detections: allDetections.map((d) => ({ ...d, source: "yolo11s" })),
        severity,
        affected_area_pct: totalPests >= 3 ? 35 : 15,
        spread_risk: severity === "High" ? "High" : "Moderate",
        healthy: false,
        about: parsed.about || known?.about || `${pestName} detected with ${confidence}% confidence.`,
        about_kn:
          parsed.about_kn ||
          known?.about_kn ||
          `${pestName} ಕೀಟವು ${confidence}% ನಿಖರತೆಯೊಂದಿಗೆ ಪತ್ತೆಯಾಗಿದೆ.`,
        symptoms: symptomsEn,
        symptoms_kn: arr(parsed.symptoms_kn, known?.symptoms_kn || symptomsEn),
        chemical: chemicalEn,
        chemical_kn: arr(parsed.chemical_kn, known?.chemical_kn || chemicalEn),
        organic: organicEn,
        organic_kn: arr(parsed.organic_kn, known?.organic_kn || organicEn),
        prevention: preventionEn,
        prevention_kn: arr(parsed.prevention_kn, known?.prevention_kn || preventionEn),
        gemini_used: true,
        yolo_used: true,
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [Pest Diagnosis] Gemini unavailable, using fallback: ${err?.message}`)
  }

  const key = pestName.toLowerCase()
  const fallback = FALLBACK_REMEDIES[key] || {}

  return {
    success: true,
    mode: "pest",
    is_plant: true,
    low_confidence: confidence < 50,
    image_quality_issue: null,
    detected_crop: cropLabel === "farm crop" ? "Crop Leaf" : cropLabel,
    scientific_name: "—",
    issue_type: "pest",
    pest_name: pestName,
    pest_name_kn: fallback.pest_name_kn || pestName,
    confidence,
    total_pests_found: totalPests,
    all_detections: allDetections.map((d) => ({ ...d, source: "yolo11s" })),
    severity,
    affected_area_pct: totalPests >= 3 ? 35 : 15,
    spread_risk: severity === "High" ? "High" : "Moderate",
    healthy: false,
    about:
      fallback.about ||
      `${pestName} pest detected with ${confidence}% confidence. This pest can cause significant crop damage if not controlled promptly.`,
    about_kn:
      fallback.about_kn ||
      `${pestName} ಕೀಟವು ${confidence}% ನಿಖರತೆಯೊಂದಿಗೆ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ ನಿಯಂತ್ರಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`,
    symptoms: fallback.symptoms || [
      "Visible pest damage on leaves and stems",
      "Discoloration or wilting of affected plant parts",
      "Reduced crop vigor and growth",
    ],
    symptoms_kn: fallback.symptoms_kn || [
      "ಎಲೆ ಮತ್ತು ಕಾಂಡಗಳ ಮೇಲೆ ಕೀಟ ಹಾನಿಯ ಗುರುತುಗಳು",
      "ಬಾಧಿತ ಭಾಗಗಳ ಬಣ್ಣ ಬದಲಾವಣೆ ಅಥವಾ ಬಾಡುವಿಕೆ",
      "ಬೆಳೆಯ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುವುದು",
    ],
    chemical: fallback.chemical || [
      "Consult your local KVK or agricultural officer for specific pesticide recommendations",
      "Use IPM (Integrated Pest Management) approach",
    ],
    chemical_kn: fallback.chemical_kn || [
      "ನಿಖರ ಕೀಟನಾಶಕ ಶಿಫಾರಸುಗಳಿಗಾಗಿ ಹತ್ತಿರದ KVK ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
      "ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ (IPM) ಪದ್ಧತಿ ಅನುಸರಿಸಿ",
    ],
    organic: fallback.organic || [
      "Neem oil spray (5 ml/L water) as first line of defense",
      "Manually remove visible pests",
      "Encourage natural predators in the field",
    ],
    organic_kn: fallback.organic_kn || [
      "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ",
      "ಕಾಣಿಸುವ ಕೀಟಗಳನ್ನು ಕೈಯಿಂದ ತೆಗೆದು ನಾಶಪಡಿಸಿ",
      "ಮಿತ್ರ ಕೀಟಗಳ ಸಂಖ್ಯೆಯನ್ನು ಹೆಚ್ಚಿಸಿ",
    ],
    prevention: fallback.prevention || [
      "Regular field scouting every 3-5 days",
      "Crop rotation with non-host crops",
      "Maintain field hygiene — remove crop residues",
    ],
    prevention_kn: fallback.prevention_kn || [
      "ಪ್ರತಿ 3-5 ದಿನಗಳಿಗೊಮ್ಮೆ ಜಮೀನು ಪರಿಶೀಲಿಸಿ",
      "ಬೆಳೆ ಸರದಿ ಪದ್ಧತಿಯನ್ನು ಅನುಸರಿಸಿ",
      "ಬೆಳೆ ತ್ಯಾಜ್ಯಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ ಹೊಲವನ್ನು ಶುಚಿಯಾಗಿಡಿ",
    ],
    gemini_used: false,
    yolo_used: true,
  }
}

/**
 * Full Hybrid Crop Scan Diagnosis:
 * Combines 102-class YOLO11s TFLite insect detections with Gemini Multimodal Vision
 * plant pathology + crop verification + bilingual EN/KN action plans.
 */
export async function runFullCropDiagnosis(params: {
  imageBuffer: Buffer
  mimeType: string
  inferResult: PestInferenceResult
  scanMode: "pest" | "crop" | "leaf"
  cropName?: string
}): Promise<DiagnosisResult> {
  const { imageBuffer, mimeType, inferResult, scanMode, cropName } = params
  const yoloDetections: PestDetection[] = (inferResult.detections || []).map((d) => ({
    ...d,
    source: "yolo11s",
  }))
  const primaryYolo = inferResult.primary
  const cleanCrop =
    cropName && !/^(auto|crop leaf)$/i.test(cropName.trim()) ? cropName.trim() : "Crop Leaf"

  // Ask Gemini Multimodal Vision to verify crop photo, spot foliar diseases/nutrients, and generate EN+KN remedies
  let vision = null
  try {
    vision = await analyzeCropImageVision(imageBuffer.toString("base64"), mimeType, {
      scanMode,
      cropName: cleanCrop,
      yoloDetections: yoloDetections.map((d) => ({
        class_name: d.class_name,
        confidence: d.confidence,
      })),
      timeoutMs: 14000,
      maxModels: 2,
    })
  } catch (err: any) {
    console.warn("⚠️ [Hybrid Vision] Vision check skipped:", err?.message || err)
  }

  // Case 1: Image is NOT a plant / crop / pest photo
  if (vision && !vision.isPlantImage) {
    return {
      success: true,
      mode: scanMode,
      is_plant: false,
      low_confidence: true,
      image_quality_issue: vision.imageQualityIssue || "too_far",
      detected_crop: cleanCrop,
      scientific_name: "—",
      issue_type: "non_crop",
      pest_name: "Not a Crop Image",
      pest_name_kn: "ಬೆಳೆ/ಎಲೆ ಚಿತ್ರ ಕಂಡುಬಂದಿಲ್ಲ",
      confidence: Math.min(25, vision.confidence),
      total_pests_found: 0,
      all_detections: [],
      severity: "None",
      affected_area_pct: 0,
      spread_risk: "None",
      healthy: false,
      message:
        vision.aboutEn ||
        "No crop leaf, plant, or agricultural insect was detected in this photo. Please capture a clear close-up of the crop leaf.",
      message_kn:
        vision.aboutKn ||
        "ಈ ಫೋಟೋದಲ್ಲಿ ಬೆಳೆ, ಎಲೆ ಅಥವಾ ಕೀಟ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಎಲೆಯ ಹತ್ತಿರದ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ.",
      about:
        vision.aboutEn ||
        "This image does not appear to show a crop leaf or plant pest. Please scan a well-lit photo of the affected leaf or plant.",
      about_kn:
        vision.aboutKn ||
        "ಈ ಚಿತ್ರದಲ್ಲಿ ಬೆಳೆ ಎಲೆ ಅಥವಾ ಕೀಟ ಕಾಣಿಸುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಮತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
      symptoms: [],
      symptoms_kn: [],
      chemical: [],
      chemical_kn: [],
      organic: [],
      organic_kn: [],
      prevention:
        vision.preventionEn.length > 0
          ? vision.preventionEn
          : [
              "Hold camera 15–20 cm from a single leaf",
              "Ensure bright natural light without glare",
              "Keep the leaf centered inside the frame",
            ],
      prevention_kn:
        vision.preventionKn.length > 0
          ? vision.preventionKn
          : [
              "ಎಲೆಯಿಂದ 15–20 ಸೆಂ.ಮೀ ದೂರದಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಹಿಡಿಯಿರಿ",
              "ಉತ್ತಮ ನೈಸರ್ಗಿಕ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ",
              "ಬಾಧಿತ ಎಲೆಯನ್ನು ಚೌಕಟ್ಟಿನ ಮಧ್ಯದಲ್ಲಿ ಇರಿಸಿ",
            ],
      gemini_used: true,
      yolo_used: inferResult.success,
    }
  }

  // Case 2: Both Vision + YOLO agree (or Vision inspected foliar disease / nutrient / pest)
  if (vision) {
    // Combine YOLO detections with Vision diagnosis in all_detections
    const combinedDetections: PestDetection[] = [...yoloDetections]
    if (
      !vision.healthy &&
      !combinedDetections.some(
        (d) => d.class_name.toLowerCase() === vision.diagnosisNameEn.toLowerCase()
      )
    ) {
      combinedDetections.push({
        class_id: -1,
        class_name: vision.diagnosisNameEn,
        confidence: vision.confidence,
        bbox: [],
        source: "gemini_vision",
      })
    }
    combinedDetections.sort((a, b) => b.confidence - a.confidence)

    const effectiveConfidence =
      primaryYolo && vision.issueType === "pest"
        ? Math.max(primaryYolo.confidence, vision.confidence)
        : vision.confidence
    const lowConf = !vision.healthy && effectiveConfidence < 50

    return {
      success: true,
      mode: scanMode,
      is_plant: true,
      low_confidence: lowConf,
      image_quality_issue: vision.imageQualityIssue,
      detected_crop: vision.detectedCrop || cleanCrop,
      scientific_name: vision.scientificName || "—",
      issue_type: vision.healthy ? "healthy" : vision.issueType,
      pest_name: vision.healthy ? null : vision.diagnosisNameEn,
      pest_name_kn: vision.healthy ? "ಆರೋಗ್ಯಕರ ಬೆಳೆ" : vision.diagnosisNameKn,
      confidence: effectiveConfidence,
      total_pests_found: vision.healthy
        ? 0
        : Math.max(1, yoloDetections.length || (vision.healthy ? 0 : 1)),
      all_detections: combinedDetections,
      severity: vision.healthy ? "None" : vision.severity,
      affected_area_pct: vision.healthy ? 0 : vision.affectedAreaPct,
      spread_risk: vision.healthy ? "None" : vision.spreadRisk,
      healthy: vision.healthy,
      message: vision.healthy
        ? `No pests or diseases detected. Your ${vision.detectedCrop || cleanCrop} appears healthy! 🌱`
        : `${vision.diagnosisNameEn} detected (${effectiveConfidence}% match).`,
      message_kn: vision.healthy
        ? `ಯಾವುದೇ ಕೀಟ ಅಥವಾ ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ. ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯವಾಗಿದೆ! 🌱`
        : `${vision.diagnosisNameKn} ಪತ್ತೆಯಾಗಿದೆ (${effectiveConfidence}% ಹೊಂದಾಣಿಕೆ).`,
      about: vision.aboutEn,
      about_kn: vision.aboutKn || vision.aboutEn,
      symptoms: vision.symptomsEn,
      symptoms_kn: vision.symptomsKn.length ? vision.symptomsKn : vision.symptomsEn,
      chemical: vision.chemicalEn,
      chemical_kn: vision.chemicalKn.length ? vision.chemicalKn : vision.chemicalEn,
      organic: vision.organicEn,
      organic_kn: vision.organicKn.length ? vision.organicKn : vision.organicEn,
      prevention: vision.preventionEn,
      prevention_kn: vision.preventionKn.length ? vision.preventionKn : vision.preventionEn,
      gemini_used: true,
      yolo_used: inferResult.success,
    }
  }

  // Case 3: Gemini Vision unavailable (offline/quota) — use YOLO11s result cleanly
  if (primaryYolo && yoloDetections.length > 0) {
    const detailed = await getDetailedDiagnosis(
      primaryYolo.pest_name,
      primaryYolo.confidence,
      inferResult.total_pests_found,
      yoloDetections,
      cleanCrop
    )
    return {
      ...detailed,
      mode: scanMode,
      detected_crop: cleanCrop,
      yolo_used: true,
    }
  }

  // Case 4: Both Gemini Vision unavailable AND YOLO found 0 insects
  return {
    success: true,
    mode: scanMode,
    is_plant: true,
    low_confidence: true,
    image_quality_issue: null,
    detected_crop: cleanCrop,
    scientific_name: "—",
    issue_type: "healthy",
    pest_name: null,
    pest_name_kn: "ಸ್ಥಳೀಯ ತಪಾಸಣೆ (ಕೀಟ ಪತ್ತೆಯಾಗಿಲ್ಲ)",
    confidence: 45,
    total_pests_found: 0,
    all_detections: [],
    severity: "None",
    affected_area_pct: 0,
    spread_risk: "None",
    healthy: true,
    message:
      "Offline insect check found 0 pests across 102 YOLO11s classes. Cloud leaf-disease & crop verification was offline — retry with internet if leaf spots exist.",
    message_kn:
      "YOLO11s 102 ಕೀಟ ವರ್ಗಗಳಲ್ಲಿ ಯಾವುದೇ ಕೀಟ ಪತ್ತೆಯಾಗಿಲ್ಲ. ಕ್ಲೌಡ್ ರೋಗ ವಿಶ್ಲೇಷಣೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಆಫ್‌ಲೈನ್ ಇದೆ.",
    about:
      "Local YOLO11s TFLite scanned all 102 insect classes and found no visible pests. If you still see spots or yellowing on the leaf, retry with active internet for fungal/bacterial pathology.",
    about_kn:
      "ಸ್ಥಳೀಯ YOLO11s TFLite ಮಾದರಿಯು 102 ಕೀಟ ವರ್ಗಗಳಲ್ಲಿ ಯಾವುದೇ ಕೀಟವನ್ನು ಪತ್ತೆ ಮಾಡಿಲ್ಲ. ಎಲೆಯ ಮೇಲೆ ಕಲೆಗಳಿದ್ದರೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕದೊಂದಿಗೆ ಮತ್ತೊಮ್ಮೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    symptoms: [
      "No visible insect pests detected by YOLO11s",
      "If leaf spots/blight are present, verify in Leaf Disease mode",
    ],
    symptoms_kn: [
      "YOLO11s ಮೂಲಕ ಯಾವುದೇ ಕೀಟ ಕಂಡುಬಂದಿಲ್ಲ",
      "ಎಲೆಯ ಮೇಲೆ ಕಲೆಗಳಿದ್ದರೆ ಎಲೆ ರೋಗ ಮೋಡ್‌ನಲ್ಲಿ ಮತ್ತೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ",
    ],
    chemical: ["No insecticide spray needed based on insect check."],
    chemical_kn: ["ಕೀಟ ತಪಾಸಣೆಯ ಆಧಾರದ ಮೇಲೆ ಯಾವುದೇ ಕೀಟನಾಶಕ ಅಗತ್ಯವಿಲ್ಲ."],
    organic: ["Neem oil 5 ml/L water can be used as a routine preventive spray."],
    organic_kn: ["ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಬಹುದು."],
    prevention: [
      "Inspect lower leaf surfaces every 3–5 days",
      "Maintain balanced irrigation and field hygiene",
    ],
    prevention_kn: [
      "ಪ್ರತಿ 3–5 ದಿನಗಳಿಗೊಮ್ಮೆ ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ",
      "ಸಮತೋಲಿತ ನೀರಾವರಿ ಮತ್ತು ಹೊಲದ ಸ್ವಚ್ಛತೆ ಕಾಪಾಡಿ",
    ],
    gemini_used: false,
    yolo_used: inferResult.success,
  }
}
