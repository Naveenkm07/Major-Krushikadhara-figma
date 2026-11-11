// ==============================================================================
// Scan Routes — Crop Pest Detection via YOLO11s TFLite
// POST /api/scan/diagnose  — Upload image for pest detection + Gemini remedies
// GET  /api/scan/health     — Check model status
// ==============================================================================

import { Router } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { diagnosePest, scanHealth } from "../controllers/scan.controller.js"

// Configure multer for image uploads
const uploadDir = path.resolve(__dirname, "../../uploads/scans")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname || ".jpg")}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP allowed.`))
    }
  },
})

const router = Router()

// POST /api/scan/diagnose — Upload crop image for pest detection
router.post("/diagnose", upload.single("image"), diagnosePest)

// GET /api/scan/health — Service health check
router.get("/health", scanHealth)

export default router

