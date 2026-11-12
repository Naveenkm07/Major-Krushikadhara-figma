import { Router } from "express"
import {
  getInsurancePortfolio,
  createInsuranceApplication,
  advanceInsuranceApplication,
  createInsuranceClaim,
  advanceInsuranceClaim,
  createInsuranceDocument,
  markInsuranceNotificationsRead,
} from "../controllers/insurance.controller.js"

const router = Router()

router.get("/", getInsurancePortfolio)
router.post("/applications", createInsuranceApplication)
router.patch("/applications/:id/advance", advanceInsuranceApplication)
router.post("/claims", createInsuranceClaim)
router.patch("/claims/:id/advance", advanceInsuranceClaim)
router.post("/documents", createInsuranceDocument)
router.patch("/notifications/read", markInsuranceNotificationsRead)

export default router

