// ==============================================================================
// Scan Routes — Crop Pest Detection via YOLO11s TFLite
// POST /api/scan/diagnose  — Upload image for pest detection + Gemini remedies
// GET  /api/scan/health     — Check model status
// ==============================================================================

import { Router } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import {
  diagnosePest,
  scanHealth,
  getScanHistory,
  deleteScanHistory,
  submitScanFeedback,
} from "../controllers/scan.controller.js"

// Configure multer for image uploads
const uploadDir = path.resolve(__dirname, "../../uploads/scans")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname || "").toLowerCase()
    const ext = /\.(jpe?g|png|webp|heic|heif)$/.test(rawExt) ? rawExt : ".jpg"
    const uniqueName = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/heic",
      "image/heif",
    ]
    const hasImageExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(file.originalname || "")
    if (allowedTypes.includes(file.mimetype) || (file.mimetype === "application/octet-stream" && hasImageExt)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, HEIC allowed.`))
    }
  },
})

const router = Router()

// POST /api/scan/diagnose — Upload crop image for pest detection
router.post("/diagnose", upload.single("image"), diagnosePest)

// GET /api/scan/health — Service health check
router.get("/health", scanHealth)

// GET /api/scan/history — Recent persisted crop scans
router.get("/history", getScanHistory)

// DELETE /api/scan/history/:id — Remove a crop scan from history
router.delete("/history/:id", deleteScanHistory)

// POST /api/scan/:id/feedback — Save farmer helpfulness feedback
router.post("/:id/feedback", submitScanFeedback)

export default router

