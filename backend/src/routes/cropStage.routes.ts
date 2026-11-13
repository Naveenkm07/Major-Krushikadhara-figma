import { Router } from "express"
import multer from "multer"
import {
  getActiveCropStage,
  updateCropStage,
  handleVoiceObservation,
  handleTextObservation,
  getCropsCatalog,
  getCropCalendarDetail,
  updateSowingDate,
} from "../controllers/cropStage.controller.js"

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max audio size
})

// GET /api/crop-stage/catalog - List all 32+ crops with category filtering & summary
router.get("/catalog", getCropsCatalog)

// GET /api/crop-stage/crop/:cropKey - Full lifecycle calendar & stage calculation for a specific crop
router.get("/crop/:cropKey", getCropCalendarDetail)

// GET /api/crop-stage/active - Active crop, current growth stage, days count & tailored advisories
router.get("/active", getActiveCropStage)

// PUT /api/crop-stage/:fieldId/stage - Update stage or health status
router.put("/:fieldId/stage", updateCropStage)

// PUT /api/crop-stage/:fieldId/sowing-date - Update sowing date or elapsed days
router.put("/:fieldId/sowing-date", updateSowingDate)

// POST /api/crop-stage/voice-input - Voice audio file -> Sarvam AI STT -> Stage-tailored guidance
router.post("/voice-input", upload.single("audio"), handleVoiceObservation)

// POST /api/crop-stage/text-input - Text query -> Stage-tailored guidance
router.post("/text-input", handleTextObservation)

export default router

