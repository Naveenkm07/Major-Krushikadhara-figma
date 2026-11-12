// ==============================================================================
// Scan Controller — Crop Pest Detection Endpoint
// Accepts image upload → YOLO TFLite inference → Gemini diagnosis → JSON response
// ==============================================================================

import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import { prisma, withDbRetry } from "../config/db.js"
import { runPestInference, runFullCropDiagnosis } from "../services/pestDetection.service.js"
import { uploadImageToCloudinary } from "../services/cloudinary.service.js"

async function persistCropScanBestEffort(params: {
  mobile: string
  cropName: string
  diseaseName: string
  confidence: number
  severity: string
  imageUrl?: string
  remediesJson?: any
}): Promise<string | null> {
  try {
    return await withDbRetry(async () => {
      let farmer = await prisma.farmer.findUnique({ where: { mobile: params.mobile } })
      if (!farmer) {
        farmer = await prisma.farmer.create({
          data: {
            mobile: params.mobile,
            name: "Farmer",
            district: "Mandya",
            state: "Karnataka",
          },
        })
      }
      const created = await prisma.cropScan.create({
        data: {
          farmerId: farmer.id,
          cropName: params.cropName,
          diseaseName: params.diseaseName,
          confidence: params.confidence,
          severity: params.severity,
          imageUrl: params.imageUrl || "local://scan",
          remediesJson: params.remediesJson ?? undefined,
        },
      })
      return created.id
    }, "persistCropScanBestEffort")
  } catch (err: any) {
    console.warn("⚠️ [Scan DB Persist Warning]:", err?.message || err)
    return null
  }
}

function normalizeScanMode(raw: unknown): "pest" | "crop" | "leaf" {
  const val = String(raw || "").trim().toLowerCase()
  if (val === "crop" || val === "leaf") return val
  return "pest"
}

/**
 * POST /api/scan/diagnose
 * Multipart form-data with 'image' field + optional 'mode', 'cropName', 'mobile'.
 * Runs YOLO11s TFLite + Gemini Vision hybrid diagnosis, persists to Neon, and returns bilingual EN+KN JSON.
 */
export async function diagnosePest(req: Request, res: Response) {
  const file = req.file
  if (!file) {
    return res.status(400).json({
      success: false,
      error: "No image file provided. Upload an image with field name 'image'.",
    })
  }

  const imagePath = file.path
  const mobile = (req.body?.mobile as string) || "9591502209"
  const rawCropName = (req.body?.cropName as string) || "Auto"
  const mode = normalizeScanMode(req.body?.mode)

  try {
    console.log(
      `📸 [Scan] Received image: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB) · mode=${mode} · crop=${rawCropName}`
    )

    const imageBuffer = fs.readFileSync(imagePath)
    const mimeType =
      file.mimetype && file.mimetype.startsWith("image/") ? file.mimetype : "image/jpeg"

    // 1 & 2. Run Cloudinary upload and YOLO11s TFLite inference in parallel
    console.log(`☁️🔬 [Scan] Uploading to Cloudinary & running YOLO11s pest detection...`)
    const [uploadRes, inferResult] = await Promise.all([
      uploadImageToCloudinary(imageBuffer, "krushikadhara/scans", file.filename).catch((cErr) => {
        console.warn("⚠️ Cloudinary upload skipped/failed:", cErr)
        return { success: false, secureUrl: "", error: "Upload skipped" }
      }),
      runPestInference(imagePath),
    ])

    const storedImageUrl = uploadRes.success && uploadRes.secureUrl ? uploadRes.secureUrl : undefined

    if (!inferResult.success) {
      return res.status(500).json({
        success: false,
        error: inferResult.error || "Inference failed",
        imageUrl: storedImageUrl,
      })
    }

    // 3. Hybrid YOLO11s + Gemini Multimodal Vision Crop & Disease Diagnosis
    const diagnosis = await runFullCropDiagnosis({
      imageBuffer,
      mimeType,
      inferResult,
      scanMode: mode,
      cropName: rawCropName,
    })

    const resolvedCrop = diagnosis.detected_crop || (rawCropName === "Auto" ? "Crop Leaf" : rawCropName)
    let scanId: string | null = null

    if (diagnosis.is_plant) {
      scanId = await persistCropScanBestEffort({
        mobile,
        cropName: resolvedCrop,
        diseaseName: diagnosis.healthy
          ? "Healthy Crop"
          : diagnosis.pest_name || "Crop Issue Detected",
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        imageUrl: storedImageUrl,
        remediesJson: {
          mode: diagnosis.mode,
          scientificName: diagnosis.scientific_name,
          issueType: diagnosis.issue_type,
          pestNameKn: diagnosis.pest_name_kn,
          detectedCrop: resolvedCrop,
          affectedAreaPct: diagnosis.affected_area_pct,
          spreadRisk: diagnosis.spread_risk,
          lowConfidence: diagnosis.low_confidence,
          message: diagnosis.message,
          messageKn: diagnosis.message_kn,
          about: diagnosis.about,
          aboutKn: diagnosis.about_kn,
          symptoms: diagnosis.symptoms,
          symptomsKn: diagnosis.symptoms_kn,
          chemical: diagnosis.chemical,
          chemicalKn: diagnosis.chemical_kn,
          organic: diagnosis.organic,
          organicKn: diagnosis.organic_kn,
          prevention: diagnosis.prevention,
          preventionKn: diagnosis.prevention_kn,
          allDetections: diagnosis.all_detections,
        },
      })
    }

    return res.json({
      ...diagnosis,
      scan_id: scanId || undefined,
      imageUrl: storedImageUrl,
    })
  } catch (err: any) {
    console.error(`❌ [Scan Controller Error]:`, err)
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal server error during pest diagnosis",
    })
  } finally {
    // Always clean up local temp file after inference & upload
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    } catch {}
  }
}

/**
 * GET /api/scan/health
 * Quick health check for the scan service.
 */
export function scanHealth(_req: Request, res: Response) {
  const modelPath = path.resolve(__dirname, "../../models/best.tflite")
  const modelExists = fs.existsSync(modelPath)
  const modelSize = modelExists
    ? `${(fs.statSync(modelPath).size / (1024 * 1024)).toFixed(1)} MB`
    : "N/A"

  res.json({
    service: "Crop Pest Detection (YOLO11s TFLite)",
    model_loaded: modelExists,
    model_size: modelSize,
    classes: 102,
    input_size: "640x640",
    status: modelExists ? "ready" : "model_missing",
  })
}

/**
 * GET /api/scan/history
 * Returns recent stored crop scans from Neon PostgreSQL.
 */
export async function getScanHistory(req: Request, res: Response) {
  try {
    const mobile = (req.query.mobile as string) || "9591502209"
    const scans = await withDbRetry(async () => {
      const farmer = await prisma.farmer.findUnique({ where: { mobile } })
      if (!farmer) return []
      return prisma.cropScan.findMany({
        where: { farmerId: farmer.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    }, "getScanHistory")
    return res.json({ success: true, scans })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch scan history",
    })
  }
}

/**
 * DELETE /api/scan/history/:id?mobile=9591502209
 * Delete a persisted crop scan record from Neon PostgreSQL.
 */
export async function deleteScanHistory(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "").trim()
    const mobile = String(req.query.mobile || "").trim()
    if (!id) {
      return res.status(400).json({ success: false, error: "Scan id is required" })
    }

    const deletedCount = await withDbRetry(async () => {
      if (mobile) {
        const farmer = await prisma.farmer.findUnique({ where: { mobile } })
        if (!farmer) return 0
        const result = await prisma.cropScan.deleteMany({
          where: { id, farmerId: farmer.id },
        })
        return result.count
      }
      const result = await prisma.cropScan.deleteMany({ where: { id } })
      return result.count
    }, "deleteScanHistory")

    return res.json({ success: true, deleted: deletedCount > 0, deletedCount })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to delete scan record",
    })
  }
}

/**
 * POST /api/scan/:id/feedback
 * Record farmer helpfulness feedback on a diagnosis inside remediesJson.
 */
export async function submitScanFeedback(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "").trim()
    const helpful = Boolean(req.body?.helpful)
    if (!id) {
      return res.status(400).json({ success: false, error: "Scan id is required" })
    }

    const updated = await withDbRetry(async () => {
      const existing = await prisma.cropScan.findUnique({ where: { id } })
      if (!existing) return null
      const prevJson =
        existing.remediesJson && typeof existing.remediesJson === "object"
          ? (existing.remediesJson as Record<string, any>)
          : {}
      return prisma.cropScan.update({
        where: { id },
        data: {
          remediesJson: {
            ...prevJson,
            feedbackHelpful: helpful,
            feedbackAt: new Date().toISOString(),
          },
        },
      })
    }, "submitScanFeedback")

    return res.json({ success: true, updated: Boolean(updated), helpful })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to record feedback",
    })
  }
}

