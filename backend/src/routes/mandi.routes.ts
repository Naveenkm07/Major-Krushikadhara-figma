import { Router } from "express"
import { getLiveMandiPrices, getNearbyMandis } from "../controllers/mandi.controller.js"

const router = Router()

// GET /api/mandi/nearby - GPS-based nearest 5 verified mandis discovery within radius + live prices
router.get("/nearby", getNearbyMandis)

// GET /api/mandi/nearest - Alias for nearby mandi discovery
router.get("/nearest", getNearbyMandis)

// GET /api/mandi/prices - Real-time live government data from data.gov.in (AGMARKNET)
router.get("/prices", getLiveMandiPrices)

export default router
