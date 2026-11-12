import { Router } from "express"
import multer from "multer"
import {
  getEquipmentMarketplace,
  uploadEquipmentImage,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  toggleEquipmentNotify,
  createEquipmentBooking,
  updateEquipmentBookingStatus,
  reviewEquipmentBooking,
  markEquipmentNotificationsRead,
} from "../controllers/equipment.controller.js"

const router = Router()

const equipPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype?.startsWith("image/") ||
      /\.(jpe?g|png|webp|heic|heif)$/i.test(file.originalname || "")
    if (ok) cb(null, true)
    else cb(new Error("Only image files (JPEG/PNG/WebP/HEIC) are supported."))
  },
})

// Marketplace sync & filters
router.get("/", getEquipmentMarketplace)

// Image upload (multipart field: "image")
router.post("/upload-image", equipPhotoUpload.single("image"), uploadEquipmentImage)

// Listing CRUD
router.post("/", createEquipment)
router.put("/:id", updateEquipment)
router.delete("/:id", deleteEquipment)

// Availability notifications
router.post("/:id/notify", toggleEquipmentNotify)
router.post("/notifications/read", markEquipmentNotificationsRead)

// Booking lifecycle & reviews
router.post("/:id/book", createEquipmentBooking)
router.put("/bookings/:bookingId/status", updateEquipmentBookingStatus)
router.post("/bookings/:bookingId/review", reviewEquipmentBooking)

export default router

