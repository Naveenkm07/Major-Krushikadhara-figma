// ==============================================================================
// Scan Controller — Crop Pest Detection Endpoint
// Accepts image upload → YOLO TFLite inference → Gemini diagnosis → JSON response
// ==============================================================================

import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import { runPestInference, getDetailedDiagnosis } from "../services/pestDetection.service.js"
import { uploadImageToCloudinary } from "../services/cloudinary.service.js"

/**
 * POST /api/scan/diagnose
 * Multipart form-data with 'image' field.
 * Returns full pest diagnosis with remedies and Cloudinary image URL.
 */
export async function diagnosePest(req: Request, res: Response) {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Upload an image with field name 'image'.",
      })
    }

    console.log(`📸 [Scan] Received image: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`)

    const imagePath = file.path
    const imageBuffer = fs.readFileSync(imagePath)

    // 1. Upload image to Cloudinary (fallback gracefully to null if credentials missing)
    console.log(`☁️ [Scan] Uploading to Cloudinary...`)
    let storedImageUrl: string | undefined = undefined
    try {
      const uploadRes = await uploadImageToCloudinary(imageBuffer, "krushikadhara/scans", file.filename)
      if (uploadRes.success && uploadRes.secureUrl) {
        storedImageUrl = uploadRes.secureUrl
      }
    } catch (cErr) {
      console.warn("⚠️ Cloudinary upload skipped/failed:", cErr)
    }

    // 2. Run YOLO TFLite inference
    console.log(`🔬 [Scan] Running YOLO11s pest detection...`)
    const inferResult = await runPestInference(imagePath)

    // Clean up local temp file after inference & upload
    try {
      fs.unlinkSync(imagePath)
    } catch {}

    if (!inferResult.success) {
      return res.status(500).json({
        success: false,
        error: inferResult.error || "Inference failed",
        imageUrl: storedImageUrl,
      })
    }

    // 3. No detections → healthy crop
    if (!inferResult.primary || inferResult.detections.length === 0) {
      return res.json({
        success: true,
        pest_name: null,
        confidence: 0,
        total_pests_found: 0,
        severity: "None",
        healthy: true,
        message: "No pests detected. Your crop appears healthy! 🌱",
        message_kn: "ಯಾವುದೇ ಕೀಟಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯವಾಗಿದೆ! 🌱",
        imageUrl: storedImageUrl,
        all_detections: [],
        about: "",
        symptoms: [],
        chemical: [],
        organic: [],
        prevention: [],
        gemini_used: false,
      })
    }

    // 4. Get detailed diagnosis with Gemini remedies
    console.log(
      `🐛 [Scan] Pest detected: "${inferResult.primary.pest_name}" (${inferResult.primary.confidence}%). Getting detailed diagnosis...`
    )

    const diagnosis = await getDetailedDiagnosis(
      inferResult.primary.pest_name,
      inferResult.primary.confidence,
      inferResult.total_pests_found,
      inferResult.detections
    )

    return res.json({
      ...diagnosis,
      imageUrl: storedImageUrl,
      healthy: false,
    })
  } catch (err: any) {
    console.error(`❌ [Scan Controller Error]:`, err)
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal server error during pest diagnosis",
    })
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

