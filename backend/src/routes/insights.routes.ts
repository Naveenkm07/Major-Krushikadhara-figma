import { Router } from "express"
import { getFarmerInsights } from "../controllers/insights.controller.js"

const router = Router()

// GET /api/insights?mobile=9591502209&range=6M|1Y|All&lat=...&lng=...
router.get("/", getFarmerInsights)

export default router

