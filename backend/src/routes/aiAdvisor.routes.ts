import { Router } from "express"
import multer from "multer"
import {
  streamAgriChat,
  handleVoiceStream,
  askAgriAdvisor,
} from "../controllers/aiAdvisor.controller.js"

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max audio size
})

// POST /api/ai/ask-stream - SSE Real-time streaming text query
router.post("/ask-stream", streamAgriChat)

// POST /api/ai/voice-stream - Audio upload -> Sarvam STT -> SSE Real-time streaming Gemini response
router.post("/voice-stream", upload.single("audio"), handleVoiceStream)

// POST /api/ai/ask - Non-streaming standard endpoint
router.post("/ask", askAgriAdvisor)

export default router

