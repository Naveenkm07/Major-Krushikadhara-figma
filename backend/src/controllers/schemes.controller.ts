import type { Request, Response } from "express"
import { prisma, withDbRetry } from "../config/db.js"
import {
  SCHEMES_CATALOG,
  type SchemeCatalogItem,
} from "../data/schemesCatalog.js"
import {
  getFallbackSchemeProgress,
  getFallbackSchemeProgressMap,
  getOrCreateFallbackFarmer,
  setFallbackSchemeProgress,
  upsertFallbackSchemeProgress,
} from "../services/farmerFallback.service.js"

export type SchemeApplicationStatus =
  | "NOT_APPLIED"
  | "CHECKLIST_READY"
  | "APPLIED"
  | "APPROVED"

export interface SchemeProgressDTO {
  bookmarked: boolean
  status: SchemeApplicationStatus
  checkedDocs: string[]
  appliedAt: string | null
  notes: string | null
  updatedAt: string | null
}

export interface SchemeEligibilityDTO {
  eligible: boolean
  matchCode: "ELIGIBLE" | "PRIORITY_KARNATAKA" | "CHECK_ACREAGE" | "OTHER_STATE"
  matchLabelEn: string
  matchLabelKn: string
}

export interface EnrichedSchemeDTO extends SchemeCatalogItem {
  eligibilityMatch: SchemeEligibilityDTO
  progress: SchemeProgressDTO
}

const VALID_STATUSES: ReadonlySet<SchemeApplicationStatus> = new Set([
  "NOT_APPLIED",
  "CHECKLIST_READY",
  "APPLIED",
  "APPROVED",
])

function defaultProgress(): SchemeProgressDTO {
  return {
    bookmarked: false,
    status: "NOT_APPLIED",
    checkedDocs: [],
    appliedAt: null,
    notes: null,
    updatedAt: null,
  }
}

function parseFarmAcres(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const parsed = parseFloat(match[1])
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

function normalizeStatus(raw: unknown): SchemeApplicationStatus {
  if (typeof raw === "string" && VALID_STATUSES.has(raw as SchemeApplicationStatus)) {
    return raw as SchemeApplicationStatus
  }
  return "NOT_APPLIED"
}

function normalizeCheckedDocs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return Array.from(
    new Set(
      raw
        .filter((item): item is string => typeof item === "string")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  )
}

function formatProgress(row: {
  bookmarked: boolean
  status: string
  checkedDocs: unknown
  appliedAt: Date | null
  notes: string | null
  updatedAt: Date
} | null | undefined): SchemeProgressDTO {
  if (!row) return defaultProgress()
  return {
    bookmarked: Boolean(row.bookmarked),
    status: normalizeStatus(row.status),
    checkedDocs: normalizeCheckedDocs(row.checkedDocs),
    appliedAt: row.appliedAt ? row.appliedAt.toISOString() : null,
    notes: row.notes ?? null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  }
}

function evaluateEligibility(
  scheme: SchemeCatalogItem,
  farmerState?: string | null,
  farmAcres?: number | null
): SchemeEligibilityDTO {
  const normalizedState = (farmerState || "Karnataka").trim()

  if (scheme.rules.targetStates && scheme.rules.targetStates.length > 0) {
    const matchesState = scheme.rules.targetStates.some((target) =>
      normalizedState.toLowerCase().includes(target.toLowerCase())
    )
    if (!matchesState) {
      return {
        eligible: false,
        matchCode: "OTHER_STATE",
        matchLabelEn: `${scheme.rules.targetStates.join("/")} Farmers Only`,
        matchLabelKn: `${scheme.rules.targetStates.join("/")} ರೈತರಿಗೆ ಮಾತ್ರ`,
      }
    }
    return {
      eligible: true,
      matchCode: "PRIORITY_KARNATAKA",
      matchLabelEn: "Eligible · Karnataka State Scheme",
      matchLabelKn: "ಅರ್ಹ · ಕರ್ನಾಟಕ ರಾಜ್ಯ ಯೋಜನೆ",
    }
  }

  if (typeof scheme.rules.maxLandAcres === "number" && typeof farmAcres === "number") {
    if (farmAcres > scheme.rules.maxLandAcres) {
      return {
        eligible: false,
        matchCode: "CHECK_ACREAGE",
        matchLabelEn: `For Small Farmers <= ${scheme.rules.maxLandAcres} ac`,
        matchLabelKn: `ಗರಿಷ್ಠ ${scheme.rules.maxLandAcres} ಎಕರೆ ಸಣ್ಣ ರೈತರಿಗೆ`,
      }
    }
    return {
      eligible: true,
      matchCode: "ELIGIBLE",
      matchLabelEn: `Matches Farm Size (${farmAcres} ac)`,
      matchLabelKn: `ನಿಮ್ಮ ಜಮೀನಿಗೆ ಅರ್ಹ (${farmAcres} ಎಕರೆ)`,
    }
  }

  return {
    eligible: true,
    matchCode: "ELIGIBLE",
    matchLabelEn: "Eligible for Your Profile",
    matchLabelKn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಅರ್ಹ",
  }
}

function normalizeSchemeMobile(raw: unknown, fallback: string = ""): string {
  const digits = String(raw || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : fallback
}

async function ensureFarmerByMobile(params: {
  mobile: string
  name?: string
  state?: string
  district?: string
  farmSize?: unknown
}) {
  const cleanMobile = normalizeSchemeMobile(params.mobile, params.mobile.trim())
  let farmer = await prisma.farmer.findUnique({ where: { mobile: cleanMobile } })
  if (!farmer) {
    const parsedSize = parseFarmAcres(params.farmSize)
    farmer = await prisma.farmer.create({
      data: {
        mobile: cleanMobile,
        name: params.name?.trim() || "Farmer",
        state: params.state?.trim() || "Karnataka",
        district: params.district?.trim() || "Mandya",
        farmSize: parsedSize ?? 2.5,
      },
    })
  }
  return farmer
}

/**
 * GET /api/schemes
 * Lists verified Central & Karnataka schemes with profile-based eligibility and persisted farmer progress.
 */
export async function listSchemes(req: Request, res: Response) {
  try {
    const mobile = normalizeSchemeMobile(req.query.mobile)
    const category = typeof req.query.category === "string" ? req.query.category.trim().toLowerCase() : "all"
    const level = typeof req.query.level === "string" ? req.query.level.trim().toLowerCase() : "all"
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : ""
    const stateParam = typeof req.query.state === "string" ? req.query.state.trim() : ""
    const farmSizeParam = parseFarmAcres(req.query.farmSize)

    let dbState: string | null = null
    let dbFarmSize: number | null = null
    const progressByScheme = new Map<string, SchemeProgressDTO>()

    if (mobile) {
      try {
        const farmer = await withDbRetry(
          () =>
            prisma.farmer.findUnique({
              where: { mobile },
              include: { schemeProgress: true },
            }),
          "listSchemes.findFarmer"
        )
        if (farmer) {
          dbState = farmer.state
          dbFarmSize = farmer.farmSize
          for (const row of farmer.schemeProgress) {
            const formatted = formatProgress(row)
            progressByScheme.set(row.schemeId, formatted)
            setFallbackSchemeProgress(mobile, row.schemeId, formatted)
          }
        } else {
          const fb = getOrCreateFallbackFarmer(mobile)
          dbState = fb.state
          dbFarmSize = fb.farmSize
          const fbMap = getFallbackSchemeProgressMap(mobile)
          fbMap.forEach((p, sId) =>
            progressByScheme.set(sId, {
              bookmarked: Boolean(p.bookmarked),
              status: normalizeStatus(p.status),
              checkedDocs: normalizeCheckedDocs(p.checkedDocs),
              appliedAt: p.appliedAt || null,
              notes: p.notes ?? null,
              updatedAt: p.updatedAt || null,
            })
          )
        }
      } catch (dbErr: any) {
        console.warn("⚠️ [Schemes DB Read Fallback]:", dbErr?.message || dbErr)
        const fb = getOrCreateFallbackFarmer(mobile)
        dbState = fb.state
        dbFarmSize = fb.farmSize
        const fbMap = getFallbackSchemeProgressMap(mobile)
        fbMap.forEach((p, sId) =>
          progressByScheme.set(sId, {
            bookmarked: Boolean(p.bookmarked),
            status: normalizeStatus(p.status),
            checkedDocs: normalizeCheckedDocs(p.checkedDocs),
            appliedAt: p.appliedAt || null,
            notes: p.notes ?? null,
            updatedAt: p.updatedAt || null,
          })
        )
      }
    }

    const effectiveState = stateParam || dbState || "Karnataka"
    const effectiveFarmAcres = farmSizeParam ?? dbFarmSize

    const allEnriched: EnrichedSchemeDTO[] = SCHEMES_CATALOG.map((scheme) => ({
      ...scheme,
      eligibilityMatch: evaluateEligibility(scheme, effectiveState, effectiveFarmAcres),
      progress: progressByScheme.get(scheme.id) ?? defaultProgress(),
    }))

    const filtered = allEnriched.filter((scheme) => {
      if (category === "karnataka" && scheme.level !== "karnataka") return false
      if (category === "saved" && !scheme.progress.bookmarked) return false
      if (
        category !== "all" &&
        category !== "karnataka" &&
        category !== "saved" &&
        scheme.category !== category
      ) {
        return false
      }
      if (level !== "all" && scheme.level !== level) return false
      if (!search) return true

      const haystack = [
        scheme.nameEn,
        scheme.nameKn,
        scheme.shortName,
        scheme.ministryEn,
        scheme.ministryKn,
        scheme.benefitSummaryEn,
        scheme.benefitSummaryKn,
        scheme.benefitAmountEn,
        scheme.portalName,
        ...scheme.tagsEn,
        ...scheme.tagsKn,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(search)
    })

    return res.json({
      success: true,
      total: allEnriched.length,
      count: filtered.length,
      summary: {
        totalSchemes: allEnriched.length,
        karnatakaCount: allEnriched.filter((s) => s.level === "karnataka").length,
        centralCount: allEnriched.filter((s) => s.level === "central").length,
        eligibleCount: allEnriched.filter((s) => s.eligibilityMatch.eligible).length,
        bookmarkedCount: allEnriched.filter((s) => s.progress.bookmarked).length,
        appliedCount: allEnriched.filter(
          (s) => s.progress.status === "APPLIED" || s.progress.status === "APPROVED"
        ).length,
      },
      farmerProfile: {
        state: effectiveState,
        farmSize: effectiveFarmAcres,
      },
      schemes: filtered,
    })
  } catch (error: any) {
    console.error("❌ [List Schemes Error]:", error)
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load government schemes",
    })
  }
}

/**
 * GET /api/schemes/:id
 * Returns full details, official portal links, eligibility match, and farmer progress for one scheme.
 */
export async function getSchemeById(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "").trim()
    const scheme = SCHEMES_CATALOG.find((s) => s.id === id)
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme '${id}' not found.`,
      })
    }

    const mobile = normalizeSchemeMobile(req.query.mobile)
    const stateParam = typeof req.query.state === "string" ? req.query.state.trim() : ""
    const farmSizeParam = parseFarmAcres(req.query.farmSize)

    let dbState: string | null = null
    let dbFarmSize: number | null = null
    let progress = defaultProgress()

    if (mobile) {
      try {
        const farmer = await withDbRetry(
          () => prisma.farmer.findUnique({ where: { mobile } }),
          "getSchemeById.findFarmer"
        )
        if (farmer) {
          dbState = farmer.state
          dbFarmSize = farmer.farmSize
          const row = await withDbRetry(
            () =>
              prisma.farmerSchemeProgress.findUnique({
                where: {
                  farmerId_schemeId: {
                    farmerId: farmer.id,
                    schemeId: id,
                  },
                },
              }),
            "getSchemeById.findProgress"
          )
          progress = formatProgress(row)
          setFallbackSchemeProgress(mobile, id, progress)
        } else {
          const fb = getOrCreateFallbackFarmer(mobile)
          dbState = fb.state
          dbFarmSize = fb.farmSize
          const fbProg = getFallbackSchemeProgress(mobile, id)
          if (fbProg) {
            progress = {
              bookmarked: Boolean(fbProg.bookmarked),
              status: normalizeStatus(fbProg.status),
              checkedDocs: normalizeCheckedDocs(fbProg.checkedDocs),
              appliedAt: fbProg.appliedAt || null,
              notes: fbProg.notes ?? null,
              updatedAt: fbProg.updatedAt || null,
            }
          }
        }
      } catch (dbErr: any) {
        console.warn("⚠️ [Scheme Detail DB Read Fallback]:", dbErr?.message || dbErr)
        const fb = getOrCreateFallbackFarmer(mobile)
        dbState = fb.state
        dbFarmSize = fb.farmSize
        const fbProg = getFallbackSchemeProgress(mobile, id)
        if (fbProg) {
          progress = {
            bookmarked: Boolean(fbProg.bookmarked),
            status: normalizeStatus(fbProg.status),
            checkedDocs: normalizeCheckedDocs(fbProg.checkedDocs),
            appliedAt: fbProg.appliedAt || null,
            notes: fbProg.notes ?? null,
            updatedAt: fbProg.updatedAt || null,
          }
        }
      }
    }

    const enriched: EnrichedSchemeDTO = {
      ...scheme,
      eligibilityMatch: evaluateEligibility(
        scheme,
        stateParam || dbState || "Karnataka",
        farmSizeParam ?? dbFarmSize
      ),
      progress,
    }

    return res.json({
      success: true,
      scheme: enriched,
    })
  } catch (error: any) {
    console.error("❌ [Get Scheme Error]:", error)
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch scheme details",
    })
  }
}

/**
 * POST /api/schemes/:id/bookmark
 * Toggles or sets bookmark status for a farmer + scheme in Neon PostgreSQL or resilient local store.
 */
export async function toggleSchemeBookmark(req: Request, res: Response) {
  const id = String(req.params.id || "").trim()
  const scheme = SCHEMES_CATALOG.find((s) => s.id === id)
  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: `Scheme '${id}' not found.`,
    })
  }

  const mobile = normalizeSchemeMobile(req.body?.mobile || req.query?.mobile, "9591502209")
  const explicitBookmarked =
    typeof req.body?.bookmarked === "boolean" ? req.body.bookmarked : undefined

  try {
    const savedRow = await withDbRetry(async () => {
      const farmer = await ensureFarmerByMobile({
        mobile,
        name: req.body?.name,
        state: req.body?.state,
        district: req.body?.district,
        farmSize: req.body?.farmSize,
      })

      const existing = await prisma.farmerSchemeProgress.findUnique({
        where: {
          farmerId_schemeId: {
            farmerId: farmer.id,
            schemeId: id,
          },
        },
      })

      const nextBookmarked =
        explicitBookmarked !== undefined
          ? explicitBookmarked
          : !(existing?.bookmarked ?? false)

      return prisma.farmerSchemeProgress.upsert({
        where: {
          farmerId_schemeId: {
            farmerId: farmer.id,
            schemeId: id,
          },
        },
        update: {
          bookmarked: nextBookmarked,
        },
        create: {
          farmerId: farmer.id,
          schemeId: id,
          bookmarked: nextBookmarked,
          status: "NOT_APPLIED",
          checkedDocs: [],
        },
      })
    }, "toggleSchemeBookmark")

    const progress = formatProgress(savedRow)
    setFallbackSchemeProgress(mobile, id, progress)
    return res.json({
      success: true,
      schemeId: id,
      progress,
    })
  } catch (error: any) {
    console.warn("⚠️ [Bookmark Scheme Fallback]:", error?.message || error)
    const saved = upsertFallbackSchemeProgress(mobile, id, (prev) => ({
      ...prev,
      bookmarked:
        explicitBookmarked !== undefined ? explicitBookmarked : !prev.bookmarked,
    }))
    return res.json({
      success: true,
      source: "Resilient Local Store",
      schemeId: id,
      progress: {
        bookmarked: Boolean(saved.bookmarked),
        status: normalizeStatus(saved.status),
        checkedDocs: normalizeCheckedDocs(saved.checkedDocs),
        appliedAt: saved.appliedAt,
        notes: saved.notes,
        updatedAt: saved.updatedAt,
      },
    })
  }
}

/**
 * PUT /api/schemes/:id/progress
 * Persists checked documents, application status, and notes for a farmer + scheme.
 */
export async function updateSchemeProgress(req: Request, res: Response) {
  const id = String(req.params.id || "").trim()
  const scheme = SCHEMES_CATALOG.find((s) => s.id === id)
  if (!scheme) {
    return res.status(404).json({
      success: false,
      message: `Scheme '${id}' not found.`,
    })
  }

  const mobile = normalizeSchemeMobile(req.body?.mobile || req.query?.mobile, "9591502209")
  const hasStatus = typeof req.body?.status === "string"
  const requestedStatus = hasStatus ? normalizeStatus(req.body.status) : undefined
  if (hasStatus && !VALID_STATUSES.has(req.body.status as SchemeApplicationStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${req.body.status}'. Allowed: NOT_APPLIED, CHECKLIST_READY, APPLIED, APPROVED.`,
    })
  }

  const hasCheckedDocs = Array.isArray(req.body?.checkedDocs)
  const allowedDocKeys = new Set(scheme.documents.map((d) => d.key))
  const sanitizedDocs = hasCheckedDocs
    ? normalizeCheckedDocs(req.body.checkedDocs).filter(
        (key) => allowedDocKeys.size === 0 || allowedDocKeys.has(key)
      )
    : undefined

  const hasBookmarked = typeof req.body?.bookmarked === "boolean"
  const hasNotes = typeof req.body?.notes === "string" || req.body?.notes === null

  try {
    const savedRow = await withDbRetry(async () => {
      const farmer = await ensureFarmerByMobile({
        mobile,
        name: req.body?.name,
        state: req.body?.state,
        district: req.body?.district,
        farmSize: req.body?.farmSize,
      })

      const existing = await prisma.farmerSchemeProgress.findUnique({
        where: {
          farmerId_schemeId: {
            farmerId: farmer.id,
            schemeId: id,
          },
        },
      })

      const nextCheckedDocs =
        sanitizedDocs !== undefined
          ? sanitizedDocs
          : normalizeCheckedDocs(existing?.checkedDocs)

      const existingStatus = normalizeStatus(existing?.status)
      let nextStatus: SchemeApplicationStatus = requestedStatus ?? existingStatus

      if (!hasStatus && sanitizedDocs !== undefined) {
        if (existingStatus === "NOT_APPLIED" || existingStatus === "CHECKLIST_READY") {
          nextStatus =
            scheme.documents.length > 0 && nextCheckedDocs.length >= scheme.documents.length
              ? "CHECKLIST_READY"
              : "NOT_APPLIED"
        }
      }

      let nextAppliedAt = existing?.appliedAt ?? null
      if (nextStatus === "APPLIED" || nextStatus === "APPROVED") {
        nextAppliedAt = existing?.appliedAt ?? new Date()
      } else if (hasStatus && (nextStatus === "NOT_APPLIED" || nextStatus === "CHECKLIST_READY")) {
        nextAppliedAt = null
      }

      return prisma.farmerSchemeProgress.upsert({
        where: {
          farmerId_schemeId: {
            farmerId: farmer.id,
            schemeId: id,
          },
        },
        update: {
          ...(hasBookmarked ? { bookmarked: req.body.bookmarked } : {}),
          ...(hasNotes ? { notes: req.body.notes } : {}),
          checkedDocs: nextCheckedDocs,
          status: nextStatus,
          appliedAt: nextAppliedAt,
        },
        create: {
          farmerId: farmer.id,
          schemeId: id,
          bookmarked: hasBookmarked ? req.body.bookmarked : false,
          status: nextStatus,
          checkedDocs: nextCheckedDocs,
          appliedAt: nextAppliedAt,
          notes: hasNotes ? req.body.notes : null,
        },
      })
    }, "updateSchemeProgress")

    const progress = formatProgress(savedRow)
    setFallbackSchemeProgress(mobile, id, progress)
    return res.json({
      success: true,
      schemeId: id,
      progress,
    })
  } catch (error: any) {
    console.warn("⚠️ [Update Scheme Progress Fallback]:", error?.message || error)
    const saved = upsertFallbackSchemeProgress(mobile, id, (prev) => {
      const nextCheckedDocs =
        sanitizedDocs !== undefined
          ? sanitizedDocs
          : normalizeCheckedDocs(prev.checkedDocs)
      const existingStatus = normalizeStatus(prev.status)
      let nextStatus: SchemeApplicationStatus = requestedStatus ?? existingStatus

      if (!hasStatus && sanitizedDocs !== undefined) {
        if (existingStatus === "NOT_APPLIED" || existingStatus === "CHECKLIST_READY") {
          nextStatus =
            scheme.documents.length > 0 && nextCheckedDocs.length >= scheme.documents.length
              ? "CHECKLIST_READY"
              : "NOT_APPLIED"
        }
      }

      let nextAppliedAt = prev.appliedAt ?? null
      if (nextStatus === "APPLIED" || nextStatus === "APPROVED") {
        nextAppliedAt = prev.appliedAt ?? new Date().toISOString()
      } else if (hasStatus && (nextStatus === "NOT_APPLIED" || nextStatus === "CHECKLIST_READY")) {
        nextAppliedAt = null
      }

      return {
        bookmarked: hasBookmarked ? req.body.bookmarked : Boolean(prev.bookmarked),
        status: nextStatus,
        checkedDocs: nextCheckedDocs,
        appliedAt: nextAppliedAt,
        notes: hasNotes ? req.body.notes : prev.notes,
        updatedAt: new Date().toISOString(),
      }
    })

    return res.json({
      success: true,
      source: "Resilient Local Store",
      schemeId: id,
      progress: {
        bookmarked: Boolean(saved.bookmarked),
        status: normalizeStatus(saved.status),
        checkedDocs: normalizeCheckedDocs(saved.checkedDocs),
        appliedAt: saved.appliedAt,
        notes: saved.notes,
        updatedAt: saved.updatedAt,
      },
    })
  }
}
