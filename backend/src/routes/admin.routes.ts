import { Router } from "express"
import {
  getStatsHandler,
  listFarmersHandler,
  getFarmerHandler,
  createFarmerHandler,
  updateFarmerHandler,
  deleteFarmerHandler,
  addPlotHandler,
  updatePlotHandler,
  deletePlotHandler,
  resetProfilesHandler,
  getCropsListHandler,
  updateSoilHandler,
  exportFarmersHandler,
  getBroadcastsHandler,
  addBroadcastHandler,
  deleteBroadcastHandler,
  getSchemesOverviewHandler,
  updateSchemeStatusHandler,
  verifyAdminLoginHandler,
  getMandiOverviewHandler,
} from "../controllers/admin.controller.js"

const router = Router()

// Authentication Gate
router.post("/auth/login", verifyAdminLoginHandler)

// Aggregate, Mandi & Data Export
router.get("/stats", getStatsHandler)
router.get("/export", exportFarmersHandler)
router.get("/mandi/overview", getMandiOverviewHandler)

// Farmers Profile CRUD
router.get("/farmers", listFarmersHandler)
router.get("/farmers/:mobile", getFarmerHandler)
router.post("/farmers", createFarmerHandler)
router.put("/farmers/:mobile", updateFarmerHandler)
router.delete("/farmers/:mobile", deleteFarmerHandler)
router.put("/farmers/:mobile/soil", updateSoilHandler)

// Crop Plots Management
router.post("/farmers/:mobile/plots", addPlotHandler)
router.put("/farmers/:mobile/plots/:plotId", updatePlotHandler)
router.delete("/farmers/:mobile/plots/:plotId", deletePlotHandler)

// Seed Reset & 32 Crop Catalog
router.post("/reset-profiles", resetProfilesHandler)
router.get("/crops", getCropsListHandler)

// Broadcast Advisories & Weather Alerts
router.get("/broadcasts", getBroadcastsHandler)
router.post("/broadcasts", addBroadcastHandler)
router.delete("/broadcasts/:id", deleteBroadcastHandler)

// Government Schemes & Subsidies Management
router.get("/schemes", getSchemesOverviewHandler)
router.put("/schemes/status", updateSchemeStatusHandler)

export default router


