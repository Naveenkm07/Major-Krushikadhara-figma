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
} from "../controllers/admin.controller.js"

const router = Router()

router.get("/stats", getStatsHandler)
router.get("/farmers", listFarmersHandler)
router.get("/farmers/:mobile", getFarmerHandler)
router.post("/farmers", createFarmerHandler)
router.put("/farmers/:mobile", updateFarmerHandler)
router.delete("/farmers/:mobile", deleteFarmerHandler)

router.post("/farmers/:mobile/plots", addPlotHandler)
router.put("/farmers/:mobile/plots/:plotId", updatePlotHandler)
router.delete("/farmers/:mobile/plots/:plotId", deletePlotHandler)

router.post("/reset-profiles", resetProfilesHandler)
router.get("/crops", getCropsListHandler)

export default router

