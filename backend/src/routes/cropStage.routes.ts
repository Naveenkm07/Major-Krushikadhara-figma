import { Router } from "express"
import multer from "multer"
import {
  getActiveCropStage,
  updateCropStage,
  handleVoiceObservation,
  handleTextObservation,
} from "../controllers/cropStage.controller.js"

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max audio size
})

// GET /api/crop-stage/active - Active crop, current growth stage, days count & tailored advisories
router.get("/active", getActiveCropStage)

// PUT /api/crop-stage/:fieldId/stage - Update stage
router.put("/:fieldId/stage", updateCropStage)

// POST /api/crop-stage/voice-input - Voice audio file -> Sarvam AI STT -> Stage-tailored guidance
router.post("/voice-input", upload.single("audio"), handleVoiceObservation)

// POST /api/crop-stage/text-input - Text query -> Stage-tailored guidance
router.post("/text-input", handleTextObservation)

export default router

