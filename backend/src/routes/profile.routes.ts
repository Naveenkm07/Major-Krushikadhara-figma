import { Router } from "express"
import multer from "multer"
import {
  getFarmerProfile,
  updateFarmerProfile,
  deleteFarmerProfile,
  uploadProfileAvatar,
  createCropField,
  updateCropField,
  deleteCropField,
  getSavedTipsHandler,
  upsertSavedTipHandler,
  deleteSavedTipHandler,
} from "../controllers/profile.controller.js"

const router = Router()

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype?.startsWith("image/") ||
      /\.(jpe?g|png|webp|heic|heif)$/i.test(file.originalname || "")
    if (ok) cb(null, true)
    else cb(new Error("Only image files (JPEG/PNG/WebP/HEIC) are supported for avatar."))
  },
})

// Profile
router.get("/", getFarmerProfile)
router.put("/", updateFarmerProfile)
router.delete("/", deleteFarmerProfile)
router.post("/avatar", avatarUpload.single("avatar"), uploadProfileAvatar)

// Farm Crop Plots CRUD
router.post("/fields", createCropField)
router.put("/fields/:id", updateCropField)
router.delete("/fields/:id", deleteCropField)

// Saved Agronomic & Scan Tips CRUD
router.get("/saved-tips", getSavedTipsHandler)
router.post("/saved-tips", upsertSavedTipHandler)
router.delete("/saved-tips/:tipKey", deleteSavedTipHandler)

export default router
