import type { Request, Response } from "express"
import {
  normalizeFallbackMobile,
  getFallbackInsuranceState,
  submitFallbackInsuranceApplication,
  advanceFallbackInsuranceApplication,
  submitFallbackInsuranceClaim,
  advanceFallbackInsuranceClaim,
  addFallbackInsuranceDocument,
  markFallbackInsuranceNotifsRead,
} from "../services/farmerFallback.service.js"

/**
 * GET /api/insurance?mobile=...
 */
export function getInsurancePortfolio(req: Request, res: Response) {
  const mobile = normalizeFallbackMobile(req.query.mobile)
  const state = getFallbackInsuranceState(mobile)
  return res.json({
    success: true,
    ...state,
  })
}

/**
 * POST /api/insurance/applications
 */
export function createInsuranceApplication(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)
  const { application, state } = submitFallbackInsuranceApplication(mobile, body)
  return res.status(201).json({
    success: true,
    application,
    state,
  })
}

/**
 * PATCH /api/insurance/applications/:id/advance
 */
export function advanceInsuranceApplication(req: Request, res: Response) {
  const { id } = req.params
  const mobile = normalizeFallbackMobile(req.body?.mobile || req.query.mobile)
  const result = advanceFallbackInsuranceApplication(mobile, id)
  if (!result) {
    return res.status(404).json({
      success: false,
      error: "Insurance application not found",
    })
  }
  return res.json({
    success: true,
    application: result.application,
    state: result.state,
  })
}

/**
 * POST /api/insurance/claims
 */
export function createInsuranceClaim(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)
  if (!String(body.lossType || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Cause of crop damage (lossType) is required",
    })
  }
  const { claim, state } = submitFallbackInsuranceClaim(mobile, {
    id: body.id,
    policyId: String(body.policyId || "pmfby-direct"),
    policyNumber: String(body.policyNumber || `PMFBY-KA-${new Date().getFullYear()}`),
    crop: String(body.crop || "Rice"),
    lossType: String(body.lossType),
    incidentDate: String(body.incidentDate || new Date().toLocaleDateString("en-IN")),
    area: String(body.area || "2.0"),
    description: String(body.description || ""),
  })
  return res.status(201).json({
    success: true,
    claim,
    state,
  })
}

/**
 * PATCH /api/insurance/claims/:id/advance
 */
export function advanceInsuranceClaim(req: Request, res: Response) {
  const { id } = req.params
  const mobile = normalizeFallbackMobile(req.body?.mobile || req.query.mobile)
  const result = advanceFallbackInsuranceClaim(mobile, id)
  if (!result) {
    return res.status(404).json({
      success: false,
      error: "Insurance claim not found",
    })
  }
  return res.json({
    success: true,
    claim: result.claim,
    state: result.state,
  })
}

/**
 * POST /api/insurance/documents
 */
export function createInsuranceDocument(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)
  const name = String(body.name || "").trim()
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Document name is required",
    })
  }
  const { document, state } = addFallbackInsuranceDocument(mobile, {
    name,
    relatedId: body.relatedId ? String(body.relatedId) : undefined,
  })
  return res.status(201).json({
    success: true,
    document,
    state,
  })
}

/**
 * PATCH /api/insurance/notifications/read
 */
export function markInsuranceNotificationsRead(req: Request, res: Response) {
  const mobile = normalizeFallbackMobile(req.body?.mobile || req.query.mobile)
  const { updatedCount, state } = markFallbackInsuranceNotifsRead(mobile)
  return res.json({
    success: true,
    updatedCount,
    state,
  })
}

