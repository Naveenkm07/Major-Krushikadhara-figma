import { Router } from "express"
import {
  listSchemes,
  getSchemeById,
  toggleSchemeBookmark,
  updateSchemeProgress,
} from "../controllers/schemes.controller.js"

const router = Router()

router.get("/", listSchemes)
router.get("/:id", getSchemeById)
router.post("/:id/bookmark", toggleSchemeBookmark)
router.put("/:id/progress", updateSchemeProgress)

export default router

