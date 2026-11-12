import { Router } from "express"
import {
  getFarmerProfile,
  updateFarmerProfile,
} from "../controllers/profile.controller.js"

const router = Router()

// GET /api/profile?mobile=9591502209
router.get("/", getFarmerProfile)

// PUT /api/profile
router.put("/", updateFarmerProfile)

export default router

