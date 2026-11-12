import type { Request, Response } from "express"
import { prisma, withDbRetry } from "../config/db.js"

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format"

const DEFAULT_CROPS = ["Rice", "Ragi", "Tomato"]

function cleanMobile(raw: unknown): string {
  const digits = String(raw || "").replace(/\D/g, "")
  if (digits.length >= 10) return digits.slice(-10)
  return "9591502209"
}

function normalizeCropName(crop: string): string {
  const c = crop.trim()
  if (!c) return "Rice"
  return c
}

function formatProfileDTO(farmer: {
  id: string
  mobile: string
  name: string | null
  state: string
  district: string
  taluk: string | null
  village: string | null
  farmSize: number
  experienceYears: number
  photoUrl: string | null
  preferredLanguage: string
  activeCrops?: Array<{ cropName: string }>
  _count?: { scans: number }
}) {
  const cropNames =
    farmer.activeCrops && farmer.activeCrops.length > 0
      ? Array.from(
          new Set(
            farmer.activeCrops.map((c) => {
              // Map "Rice (Paddy)" cleanly while keeping custom crops intact
              if (/^rice\s*\(paddy\)$/i.test(c.cropName.trim())) return "Rice"
              return c.cropName.trim()
            })
          )
        )
      : DEFAULT_CROPS

  return {
    id: farmer.id,
    mobile: farmer.mobile,
    name: farmer.name || "Farmer",
    state: farmer.state || "Karnataka",
    district: farmer.district || "Mandya",
    taluk: farmer.taluk || "Pandavapura",
    village: farmer.village || "Channasandra",
    farmSize: String(farmer.farmSize ?? 4.2),
    experience: farmer.experienceYears ?? 5,
    photoUrl: farmer.photoUrl || DEFAULT_PHOTO,
    preferredLanguage: farmer.preferredLanguage === "en" ? "en" : "kn",
    crops: cropNames,
    scansCount: farmer._count?.scans ?? 0,
  }
}

/**
 * GET /api/profile?mobile=9591502209
 * Fetch or bootstrap a farmer's profile and active crops from Neon PostgreSQL.
 */
export async function getFarmerProfile(req: Request, res: Response) {
  try {
    const mobile = cleanMobile(req.query.mobile)

    const farmer = await withDbRetry(async () => {
      let existing = await prisma.farmer.findUnique({
        where: { mobile },
        include: {
          activeCrops: { orderBy: { createdAt: "asc" } },
          _count: { select: { scans: true } },
        },
      })

      if (!existing) {
        const defaultSowing = new Date()
        defaultSowing.setDate(defaultSowing.getDate() - 35)

        existing = await prisma.farmer.create({
          data: {
            mobile,
            name: mobile === "9591502209" ? "Naveen Kumar KM" : "Farmer",
            state: "Karnataka",
            district: "Mandya",
            taluk: "Pandavapura",
            village: "Channasandra",
            farmSize: 4.2,
            experienceYears: 6,
            photoUrl: DEFAULT_PHOTO,
            preferredLanguage: "kn",
            activeCrops: {
              create: DEFAULT_CROPS.map((cropName, idx) => ({
                cropName: cropName === "Rice" ? "Rice (Paddy)" : cropName,
                variety: idx === 0 ? "BPT 5204 (Sona Masoori)" : "Local High-Yield",
                sowingDate: defaultSowing,
                currentStage: "TILLERING_VEGETATIVE",
                stageDayCount: 35,
                healthStatus: "HEALTHY",
              })),
            },
          },
          include: {
            activeCrops: { orderBy: { createdAt: "asc" } },
            _count: { select: { scans: true } },
          },
        })
      }

      return existing
    }, "getFarmerProfile")

    return res.json({
      success: true,
      source: "Neon PostgreSQL",
      profile: formatProfileDTO(farmer),
    })
  } catch (err: any) {
    console.error("❌ [Profile GET Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: "Failed to load farmer profile",
    })
  }
}

/**
 * PUT /api/profile
 * Update a farmer's profile & active crop list in Neon PostgreSQL.
 */
export async function updateFarmerProfile(req: Request, res: Response) {
  try {
    const body = req.body || {}
    const mobile = cleanMobile(body.mobile)

    const parsedFarmSize =
      body.farmSize !== undefined ? parseFloat(String(body.farmSize)) : undefined
    if (
      parsedFarmSize !== undefined &&
      (!Number.isFinite(parsedFarmSize) || parsedFarmSize <= 0 || parsedFarmSize > 5000)
    ) {
      return res.status(400).json({
        success: false,
        error: "Farm size must be a positive number",
      })
    }

    const parsedExperience =
      body.experience !== undefined ? parseInt(String(body.experience), 10) : undefined
    if (
      parsedExperience !== undefined &&
      (!Number.isFinite(parsedExperience) || parsedExperience < 0 || parsedExperience > 90)
    ) {
      return res.status(400).json({
        success: false,
        error: "Experience years must be between 0 and 90",
      })
    }

    const requestedCrops: string[] | null = Array.isArray(body.crops)
      ? Array.from(
          new Set(
            body.crops
              .map((c: unknown) => normalizeCropName(String(c || "")))
              .filter(Boolean)
          )
        )
      : null

    const updatedFarmer = await withDbRetry(async () => {
      let farmer = await prisma.farmer.findUnique({ where: { mobile } })

      const updateFields: Record<string, any> = {}
      if (typeof body.name === "string" && body.name.trim()) updateFields.name = body.name.trim()
      if (typeof body.state === "string" && body.state.trim()) updateFields.state = body.state.trim()
      if (typeof body.district === "string" && body.district.trim()) {
        updateFields.district = body.district.trim()
      }
      if (typeof body.taluk === "string") updateFields.taluk = body.taluk.trim()
      if (typeof body.village === "string") updateFields.village = body.village.trim()
      if (typeof body.photoUrl === "string" && body.photoUrl.trim()) {
        updateFields.photoUrl = body.photoUrl.trim()
      }
      if (body.preferredLanguage === "en" || body.preferredLanguage === "kn") {
        updateFields.preferredLanguage = body.preferredLanguage
      }
      if (parsedFarmSize !== undefined) updateFields.farmSize = parsedFarmSize
      if (parsedExperience !== undefined) updateFields.experienceYears = parsedExperience

      if (!farmer) {
        farmer = await prisma.farmer.create({
          data: {
            mobile,
            name: updateFields.name || "Farmer",
            state: updateFields.state || "Karnataka",
            district: updateFields.district || "Mandya",
            taluk: updateFields.taluk ?? "Pandavapura",
            village: updateFields.village ?? "Channasandra",
            farmSize: updateFields.farmSize ?? 4.2,
            experienceYears: updateFields.experienceYears ?? 5,
            photoUrl: updateFields.photoUrl || DEFAULT_PHOTO,
            preferredLanguage: updateFields.preferredLanguage || "kn",
          },
        })
      } else if (Object.keys(updateFields).length > 0) {
        farmer = await prisma.farmer.update({
          where: { id: farmer.id },
          data: updateFields,
        })
      }

      if (requestedCrops && requestedCrops.length > 0) {
        const existingFields = await prisma.cropField.findMany({
          where: { farmerId: farmer.id },
          orderBy: { createdAt: "asc" },
        })

        const toDbName = (c: string) => (c.toLowerCase() === "rice" ? "Rice (Paddy)" : c)
        const desiredDbNames = requestedCrops.map(toDbName)
        const desiredLower = new Set(desiredDbNames.map((n) => n.toLowerCase()))

        // Delete removed crops (only if at least one desired crop remains)
        const toDeleteIds = existingFields
          .filter((f) => !desiredLower.has(f.cropName.toLowerCase()))
          .map((f) => f.id)
        if (toDeleteIds.length > 0) {
          await prisma.cropField.deleteMany({
            where: { id: { in: toDeleteIds } },
          })
        }

        // Add newly selected crops
        const existingLower = new Set(existingFields.map((f) => f.cropName.toLowerCase()))
        const defaultSowing = new Date()
        defaultSowing.setDate(defaultSowing.getDate() - 35)

        for (const dbName of desiredDbNames) {
          if (!existingLower.has(dbName.toLowerCase())) {
            await prisma.cropField.create({
              data: {
                farmerId: farmer.id,
                cropName: dbName,
                variety:
                  dbName === "Rice (Paddy)"
                    ? "BPT 5204 (Sona Masoori)"
                    : "Local High-Yield",
                sowingDate: defaultSowing,
                currentStage: "TILLERING_VEGETATIVE",
                stageDayCount: 35,
                healthStatus: "HEALTHY",
              },
            })
          }
        }
      }

      return prisma.farmer.findUniqueOrThrow({
        where: { id: farmer.id },
        include: {
          activeCrops: { orderBy: { createdAt: "asc" } },
          _count: { select: { scans: true } },
        },
      })
    }, "updateFarmerProfile")

    return res.json({
      success: true,
      source: "Neon PostgreSQL",
      profile: formatProfileDTO(updatedFarmer),
    })
  } catch (err: any) {
    console.error("❌ [Profile PUT Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: "Failed to save farmer profile",
    })
  }
}

