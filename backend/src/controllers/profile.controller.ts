import type { Request, Response } from "express"
import { prisma, withDbRetry } from "../config/db.js"
import { uploadImageToCloudinary } from "../services/cloudinary.service.js"
import { getCropGrowthStage } from "../services/stageAdvisory.service.js"
import {
  cacheFallbackFarmer,
  deleteFallbackFarmerAccount,
  getFallbackTips,
  getOrCreateFallbackFarmer,
  setFallbackTips,
} from "../services/farmerFallback.service.js"

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=160&h=160&fit=crop&auto=format"

const DEFAULT_CROPS = ["Rice", "Ragi", "Tomato"]

const STARTER_TIPS = [
  {
    tipKey: "tip_pest_early_blight",
    categoryEn: "Disease",
    categoryKn: "ರೋಗ",
    titleEn: "Early Blight in Tomato",
    titleKn: "ಟೊಮೆಟೊದಲ್ಲಿ ಆರಂಭಿಕ ಅಂಗಮಾರಿ",
    bodyEn:
      "Remove lower infected leaves immediately and spray Mancozeb 75% WP @ 2 g/L at 10-day intervals.",
    bodyKn:
      "ಸೋಂಕಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ ಮತ್ತು ಪ್ರತಿ 10 ದಿನಕ್ಕೊಮ್ಮೆ ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP (2 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
  },
  {
    tipKey: "tip_pest_neem",
    categoryEn: "Pest Control",
    categoryKn: "ಕೀಟ ನಿಯಂತ್ರಣ",
    titleEn: "Organic Neem Oil Spray",
    titleKn: "ಸಾವಯವ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಣೆ",
    bodyEn:
      "Mix 5 ml cold-pressed Neem oil (1500 ppm) + 1 ml mild liquid soap per liter. Spray early morning or evening.",
    bodyKn:
      "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು 1 ಮಿ.ಲೀ ದ್ರವ ಸಾಬೂನು ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
  },
  {
    tipKey: "tip_irrigation_rice",
    categoryEn: "Irrigation",
    categoryKn: "ನೀರಾವರಿ",
    titleEn: "Alternate Wetting & Drying (AWD)",
    titleKn: "ಪರ್ಯಾಯ ನೀರಾವರಿ ಪದ್ಧತಿ (AWD)",
    bodyEn:
      "Maintain 2-3 cm shallow standing water during tillering in Paddy. Saves up to 20% irrigation water without yield loss.",
    bodyKn:
      "ಭತ್ತದ ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ತೆಳು ನೀರು ನಿಲ್ಲಿಸಿ. ಇದರಿಂದ ಇಳುವರಿ ಕಡಿಮೆಯಾಗದೆ 20% ನೀರು ಉಳಿಯುತ್ತದೆ.",
    isUserSaved: false,
  },
  {
    tipKey: "tip_soil_zinc",
    categoryEn: "Nutrition",
    categoryKn: "ಪೋಷಕಾಂಶ",
    titleEn: "Correcting Zinc Deficiency",
    titleKn: "ಸತು (Zinc) ಕೊರತೆ ನಿವಾರಣೆ",
    bodyEn:
      "For rusty-brown spots in paddy leaves, apply Zinc Sulphate @ 10 kg/acre or foliar spray 5 g/L.",
    bodyKn:
      "ಭತ್ತದ ಎಲೆಗಳಲ್ಲಿ ತುಕ್ಕು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಂಡರೆ ಪ್ರತಿ ಎಕರೆಗೆ 10 ಕೆ.ಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ಹಾಕಿ ಅಥವಾ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
    isUserSaved: false,
  },
]

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

function displayCropName(crop: string): string {
  if (/^rice\s*\(paddy\)$/i.test(crop.trim())) return "Rice"
  return crop.trim()
}

function toDbCropName(c: string): string {
  return c.trim().toLowerCase() === "rice" ? "Rice (Paddy)" : c.trim()
}

function formatProfileDTO(farmer: any) {
  const rawFields = Array.isArray(farmer.activeCrops) ? farmer.activeCrops : []
  const totalAcres = Number(farmer.farmSize) || 4.2
  const equalShare = rawFields.length > 0 ? Math.round((totalAcres / rawFields.length) * 10) / 10 : totalAcres

  const cropFields = rawFields.map((f: any) => {
    const sowingDate = f.sowingDate ? new Date(f.sowingDate) : new Date(Date.now() - 35 * 86400000)
    const daysSinceSowing = Math.max(1, Math.floor((Date.now() - sowingDate.getTime()) / 86400000))
    const stageDef = getCropGrowthStage(f.cropName, daysSinceSowing)

    return {
      id: f.id,
      cropName: displayCropName(f.cropName),
      rawCropName: f.cropName,
      variety: f.variety || "Local High-Yield",
      acreage: typeof f.acreage === "number" && f.acreage > 0 ? f.acreage : equalShare,
      season: f.season || "Kharif",
      irrigationMethod: f.irrigationMethod || farmer.irrigationType || "Borewell + Drip",
      sowingDate: sowingDate.toISOString(),
      daysSinceSowing,
      currentStage: stageDef.key,
      currentStageNameEn: stageDef.nameEn,
      currentStageNameKn: stageDef.nameKn,
      healthStatus: f.healthStatus || "HEALTHY",
    }
  })

  const cropNames =
    cropFields.length > 0
      ? Array.from(new Set(cropFields.map((c: any) => c.cropName)))
      : DEFAULT_CROPS

  return {
    id: farmer.id,
    mobile: farmer.mobile,
    name: farmer.name || "Farmer",
    nameKn: farmer.nameKn || (farmer.mobile === "9591502209" ? "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ" : farmer.name || "ರೈತ"),
    email: farmer.email || (farmer.mobile === "9591502209" ? "naveen.krushika@gmail.com" : ""),
    state: farmer.state || "Karnataka",
    district: farmer.district || "Mandya",
    taluk: farmer.taluk || "Pandavapura",
    village: farmer.village || "Channasandra",
    farmSize: String(farmer.farmSize ?? 4.2),
    experience: farmer.experienceYears ?? 5,
    photoUrl: farmer.photoUrl || DEFAULT_PHOTO,
    preferredLanguage: farmer.preferredLanguage === "en" ? "en" : "kn",
    soilType: farmer.soilType || "Red Loam",
    irrigationType: farmer.irrigationType || "Borewell + Drip",
    rtcVerified: Boolean(farmer.rtcVerified ?? (farmer.mobile === "9591502209")),
    soilN: farmer.soilN ?? null,
    soilP: farmer.soilP ?? null,
    soilK: farmer.soilK ?? null,
    soilPh: farmer.soilPh ?? null,
    notificationsOn: farmer.notificationsOn ?? true,
    offlineModeOn: farmer.offlineModeOn ?? true,
    crops: cropNames,
    cropFields,
    scansCount: farmer._count?.scans ?? 0,
    savedTipsCount: farmer._count?.savedTips ?? 0,
  }
}

async function ensureFarmerLoaded(mobile: string) {
  let existing = await prisma.farmer.findUnique({
    where: { mobile },
    include: {
      activeCrops: { orderBy: { createdAt: "asc" } },
      _count: { select: { scans: true, savedTips: true } },
    },
  })

  if (!existing) {
    const defaultSowing = new Date()
    defaultSowing.setDate(defaultSowing.getDate() - 35)
    const isDemo = mobile === "9591502209"

    existing = await prisma.farmer.create({
      data: {
        mobile,
        name: isDemo ? "Naveen Kumar KM" : "Farmer",
        nameKn: isDemo ? "ನವೀನ್ ಕುಮಾರ್ ಕೆಎಂ" : "ರೈತ",
        email: isDemo ? "naveen.krushika@gmail.com" : null,
        state: "Karnataka",
        district: "Mandya",
        taluk: "Pandavapura",
        village: "Channasandra",
        farmSize: 4.2,
        experienceYears: 6,
        photoUrl: DEFAULT_PHOTO,
        preferredLanguage: "kn",
        soilType: "Red Loam",
        irrigationType: "Borewell + Drip",
        rtcVerified: isDemo,
        notificationsOn: true,
        offlineModeOn: true,
        activeCrops: {
          create: [
            {
              cropName: "Rice (Paddy)",
              variety: "BPT 5204 (Sona Masoori)",
              acreage: 2.0,
              season: "Kharif",
              sowingDate: defaultSowing,
              currentStage: "TILLERING_VEGETATIVE",
              stageDayCount: 35,
              healthStatus: "HEALTHY",
            },
            {
              cropName: "Ragi",
              variety: "GPU-28 High-Yield",
              acreage: 1.2,
              season: "Kharif",
              sowingDate: defaultSowing,
              currentStage: "TILLERING_VEGETATIVE",
              stageDayCount: 35,
              healthStatus: "HEALTHY",
            },
            {
              cropName: "Tomato",
              variety: "Arka Rakshak",
              acreage: 1.0,
              season: "Kharif",
              sowingDate: defaultSowing,
              currentStage: "TILLERING_VEGETATIVE",
              stageDayCount: 35,
              healthStatus: "HEALTHY",
            },
          ],
        },
        savedTips: {
          create: STARTER_TIPS,
        },
      },
      include: {
        activeCrops: { orderBy: { createdAt: "asc" } },
        _count: { select: { scans: true, savedTips: true } },
      },
    })
  }

  return existing
}

/**
 * GET /api/profile?mobile=9591502209
 */
export async function getFarmerProfile(req: Request, res: Response) {
  const mobile = cleanMobile(req.query.mobile)
  try {
    const farmer = await withDbRetry(() => ensureFarmerLoaded(mobile), "getFarmerProfile")
    cacheFallbackFarmer(farmer)
    return res.json({
      success: true,
      source: "Neon PostgreSQL",
      profile: formatProfileDTO(farmer),
    })
  } catch (err: any) {
    console.warn("⚠️ [Profile GET Fallback]:", err?.message || err)
    const fb = getOrCreateFallbackFarmer(mobile)
    return res.json({
      success: true,
      source: "Resilient Local Store",
      profile: formatProfileDTO(fb),
    })
  }
}

/**
 * PUT /api/profile
 * Update farmer personal details, location, soil health card, preferences & active crops.
 */
export async function updateFarmerProfile(req: Request, res: Response) {
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

  const updateFields: Record<string, any> = {}
  if (typeof body.name === "string" && body.name.trim()) updateFields.name = body.name.trim()
  if (typeof body.nameKn === "string") updateFields.nameKn = body.nameKn.trim() || null
  if (typeof body.email === "string") updateFields.email = body.email.trim() || null
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
  if (typeof body.soilType === "string" && body.soilType.trim()) {
    updateFields.soilType = body.soilType.trim()
  }
  if (typeof body.irrigationType === "string" && body.irrigationType.trim()) {
    updateFields.irrigationType = body.irrigationType.trim()
  }
  if (typeof body.rtcVerified === "boolean") updateFields.rtcVerified = body.rtcVerified
  if (typeof body.notificationsOn === "boolean") {
    updateFields.notificationsOn = body.notificationsOn
  }
  if (typeof body.offlineModeOn === "boolean") {
    updateFields.offlineModeOn = body.offlineModeOn
  }

  if (body.soilN !== undefined) {
    const val = body.soilN === null || body.soilN === "" ? null : parseInt(String(body.soilN), 10)
    if (val === null || (Number.isFinite(val) && val >= 0 && val <= 100)) {
      updateFields.soilN = val
    }
  }
  if (body.soilP !== undefined) {
    const val = body.soilP === null || body.soilP === "" ? null : parseInt(String(body.soilP), 10)
    if (val === null || (Number.isFinite(val) && val >= 0 && val <= 100)) {
      updateFields.soilP = val
    }
  }
  if (body.soilK !== undefined) {
    const val = body.soilK === null || body.soilK === "" ? null : parseInt(String(body.soilK), 10)
    if (val === null || (Number.isFinite(val) && val >= 0 && val <= 100)) {
      updateFields.soilK = val
    }
  }
  if (body.soilPh !== undefined) {
    const val = body.soilPh === null || body.soilPh === "" ? null : parseFloat(String(body.soilPh))
    if (val === null) {
      updateFields.soilPh = null
    } else if (Number.isFinite(val) && val >= 3 && val <= 10) {
      updateFields.soilPh = Math.round(val * 10) / 10
    }
  }

  try {
    const updatedFarmer = await withDbRetry(async () => {
      let farmer = await ensureFarmerLoaded(mobile)

      if (Object.keys(updateFields).length > 0) {
        farmer = await prisma.farmer.update({
          where: { id: farmer.id },
          data: updateFields,
          include: {
            activeCrops: { orderBy: { createdAt: "asc" } },
            _count: { select: { scans: true, savedTips: true } },
          },
        })
      }

      if (requestedCrops && requestedCrops.length > 0) {
        const existingFields = await prisma.cropField.findMany({
          where: { farmerId: farmer.id },
          orderBy: { createdAt: "asc" },
        })

        const desiredDbNames = requestedCrops.map(toDbCropName)
        const desiredLower = new Set(desiredDbNames.map((n) => n.toLowerCase()))

        const toDeleteIds = existingFields
          .filter((f) => !desiredLower.has(f.cropName.toLowerCase()))
          .map((f) => f.id)
        if (toDeleteIds.length > 0) {
          await prisma.cropField.deleteMany({
            where: { id: { in: toDeleteIds } },
          })
        }

        const existingLower = new Set(existingFields.map((f) => f.cropName.toLowerCase()))
        const defaultSowing = new Date()
        defaultSowing.setDate(defaultSowing.getDate() - 35)
        const defaultPlotAcreage =
          Math.round(((parsedFarmSize ?? farmer.farmSize) / Math.max(desiredDbNames.length, 1)) * 10) / 10

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
                acreage: defaultPlotAcreage,
                season: "Kharif",
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
          _count: { select: { scans: true, savedTips: true } },
        },
      })
    }, "updateFarmerProfile")

    cacheFallbackFarmer(updatedFarmer)
    return res.json({
      success: true,
      source: "Neon PostgreSQL",
      profile: formatProfileDTO(updatedFarmer),
    })
  } catch (err: any) {
    console.warn("⚠️ [Profile PUT Fallback]:", err?.message || err)
    const fb = getOrCreateFallbackFarmer(mobile)
    Object.assign(fb, updateFields)

    if (requestedCrops && requestedCrops.length > 0) {
      const desiredDbNames = requestedCrops.map(toDbCropName)
      const desiredLower = new Set(desiredDbNames.map((n) => n.toLowerCase()))
      fb.activeCrops = (fb.activeCrops || []).filter((f: any) =>
        desiredLower.has(String(f.cropName || "").toLowerCase())
      )
      const existingLower = new Set(fb.activeCrops.map((f: any) => String(f.cropName || "").toLowerCase()))
      const defaultSowing = new Date(Date.now() - 35 * 86400000)
      const defaultPlotAcreage =
        Math.round(((parsedFarmSize ?? fb.farmSize) / Math.max(desiredDbNames.length, 1)) * 10) / 10

      for (const dbName of desiredDbNames) {
        if (!existingLower.has(dbName.toLowerCase())) {
          fb.activeCrops.push({
            id: `local-field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            cropName: dbName,
            variety: dbName === "Rice (Paddy)" ? "BPT 5204 (Sona Masoori)" : "Local High-Yield",
            acreage: defaultPlotAcreage,
            season: "Kharif",
            irrigationMethod: fb.irrigationType || "Borewell + Drip",
            sowingDate: defaultSowing,
            currentStage: "TILLERING_VEGETATIVE",
            stageDayCount: 35,
            healthStatus: "HEALTHY",
          })
        }
      }
    }

    cacheFallbackFarmer(fb)
    return res.json({
      success: true,
      source: "Resilient Local Store",
      profile: formatProfileDTO(fb),
    })
  }
}

function detectAvatarMime(buf: Buffer, name: string): string {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png"
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp"
  }
  if (/\.png$/i.test(name)) return "image/png"
  if (/\.webp$/i.test(name)) return "image/webp"
  return "image/jpeg"
}

/**
 * POST /api/profile/avatar
 * Uploads a farmer profile photo to Cloudinary (or inline data URI fallback offline)
 * and updates Farmer.photoUrl in Neon PostgreSQL or resilient local store.
 */
export async function uploadProfileAvatar(req: Request, res: Response) {
  try {
    const file = req.file
    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        error: "No avatar image provided. Use multipart field name 'avatar'.",
      })
    }

    const mobile = cleanMobile(req.body?.mobile)
    const uploadRes = await uploadImageToCloudinary(
      file.buffer,
      "krushikadhara/avatars",
      file.originalname || `avatar_${mobile}.jpg`
    )

    let resolvedPhotoUrl = uploadRes.success && uploadRes.secureUrl ? uploadRes.secureUrl : ""
    let imageSource = "Cloudinary CDN"
    if (!resolvedPhotoUrl) {
      if (file.buffer.length <= 4 * 1024 * 1024) {
        const mime = detectAvatarMime(file.buffer, file.originalname || "avatar.jpg")
        resolvedPhotoUrl = `data:${mime};base64,${file.buffer.toString("base64")}`
        imageSource = "Local Inline Storage"
      } else {
        return res.status(502).json({
          success: false,
          error: uploadRes.error || "Failed to upload avatar to Cloudinary",
        })
      }
    }

    try {
      const updatedFarmer = await withDbRetry(async () => {
        const farmer = await ensureFarmerLoaded(mobile)
        return prisma.farmer.update({
          where: { id: farmer.id },
          data: { photoUrl: resolvedPhotoUrl },
          include: {
            activeCrops: { orderBy: { createdAt: "asc" } },
            _count: { select: { scans: true, savedTips: true } },
          },
        })
      }, "uploadProfileAvatar")

      cacheFallbackFarmer(updatedFarmer)
      return res.json({
        success: true,
        source: imageSource,
        photoUrl: resolvedPhotoUrl,
        profile: formatProfileDTO(updatedFarmer),
      })
    } catch (dbErr: any) {
      console.warn("⚠️ [Avatar DB Fallback]:", dbErr?.message || dbErr)
      const fb = getOrCreateFallbackFarmer(mobile)
      fb.photoUrl = resolvedPhotoUrl
      cacheFallbackFarmer(fb)
      return res.json({
        success: true,
        source: "Resilient Local Store",
        photoUrl: resolvedPhotoUrl,
        profile: formatProfileDTO(fb),
      })
    }
  } catch (err: any) {
    console.error("❌ [Avatar Upload Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: "Failed to upload avatar image",
    })
  }
}

/**
 * POST /api/profile/fields
 * Add a crop plot under the farmer's farm.
 */
export async function createCropField(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = cleanMobile(body.mobile)
  const rawName = String(body.cropName || "").trim()
  if (!rawName) {
    return res.status(400).json({ success: false, error: "Crop name is required" })
  }

  const acreage =
    body.acreage !== undefined ? parseFloat(String(body.acreage)) : 1.0
  if (!Number.isFinite(acreage) || acreage <= 0 || acreage > 1000) {
    return res.status(400).json({ success: false, error: "Valid positive plot acreage is required" })
  }

  const sowingDate = body.sowingDate ? new Date(body.sowingDate) : new Date(Date.now() - 30 * 86400000)
  const validSowing = Number.isNaN(sowingDate.getTime())
    ? new Date(Date.now() - 30 * 86400000)
    : sowingDate
  const daysSinceSowing = Math.max(1, Math.floor((Date.now() - validSowing.getTime()) / 86400000))
  const stageDef = getCropGrowthStage(rawName, daysSinceSowing)
  const variety = typeof body.variety === "string" && body.variety.trim() ? body.variety.trim() : "Local High-Yield"
  const season = typeof body.season === "string" && body.season.trim() ? body.season.trim() : "Kharif"
  const irrigationMethod = typeof body.irrigationMethod === "string" ? body.irrigationMethod.trim() : undefined
  const healthStatus = typeof body.healthStatus === "string" && body.healthStatus.trim() ? body.healthStatus.trim() : "HEALTHY"
  const roundedAcreage = Math.round(acreage * 10) / 10
  const dbCropName = toDbCropName(rawName)

  try {
    const updatedFarmer = await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)
      await prisma.cropField.create({
        data: {
          farmerId: farmer.id,
          cropName: dbCropName,
          variety,
          acreage: roundedAcreage,
          season,
          irrigationMethod,
          sowingDate: validSowing,
          currentStage: stageDef.key,
          stageDayCount: daysSinceSowing,
          healthStatus,
        },
      })

      // Keep total farmSize in sync if sum of plots exceeds total farm size
      const allFields = await prisma.cropField.findMany({ where: { farmerId: farmer.id } })
      const sumAcres = allFields.reduce((acc, f) => acc + (f.acreage || 0), 0)
      if (sumAcres > farmer.farmSize) {
        await prisma.farmer.update({
          where: { id: farmer.id },
          data: { farmSize: Math.round(sumAcres * 10) / 10 },
        })
      }

      return prisma.farmer.findUniqueOrThrow({
        where: { id: farmer.id },
        include: {
          activeCrops: { orderBy: { createdAt: "asc" } },
          _count: { select: { scans: true, savedTips: true } },
        },
      })
    }, "createCropField")

    cacheFallbackFarmer(updatedFarmer)
    return res.status(201).json({
      success: true,
      profile: formatProfileDTO(updatedFarmer),
    })
  } catch (err: any) {
    console.warn("⚠️ [Create CropField Fallback]:", err?.message || err)
    const fb = getOrCreateFallbackFarmer(mobile)
    fb.activeCrops.push({
      id: `local-field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cropName: dbCropName,
      variety,
      acreage: roundedAcreage,
      season,
      irrigationMethod: irrigationMethod || fb.irrigationType || "Borewell + Drip",
      sowingDate: validSowing,
      currentStage: stageDef.key,
      stageDayCount: daysSinceSowing,
      healthStatus,
    })
    const sumAcres = fb.activeCrops.reduce((acc: number, f: any) => acc + (Number(f.acreage) || 0), 0)
    if (sumAcres > Number(fb.farmSize || 0)) {
      fb.farmSize = Math.round(sumAcres * 10) / 10
    }
    cacheFallbackFarmer(fb)
    return res.status(201).json({
      success: true,
      profile: formatProfileDTO(fb),
    })
  }
}

/**
 * PUT /api/profile/fields/:id
 */
export async function updateCropField(req: Request, res: Response) {
  const { id } = req.params
  const body = req.body || {}
  const mobile = cleanMobile(body.mobile)

  const data: Record<string, any> = {}
  if (typeof body.cropName === "string" && body.cropName.trim()) {
    data.cropName = toDbCropName(body.cropName)
  }
  if (typeof body.variety === "string") data.variety = body.variety.trim() || "Local High-Yield"
  if (body.acreage !== undefined) {
    const ac = parseFloat(String(body.acreage))
    if (Number.isFinite(ac) && ac > 0 && ac <= 1000) data.acreage = Math.round(ac * 10) / 10
  }
  if (typeof body.season === "string" && body.season.trim()) data.season = body.season.trim()
  if (typeof body.healthStatus === "string" && body.healthStatus.trim()) {
    data.healthStatus = body.healthStatus.trim()
  }
  if (typeof body.irrigationMethod === "string") {
    data.irrigationMethod = body.irrigationMethod.trim() || null
  }
  if (body.sowingDate) {
    const sd = new Date(body.sowingDate)
    if (!Number.isNaN(sd.getTime())) {
      data.sowingDate = sd
      const days = Math.max(1, Math.floor((Date.now() - sd.getTime()) / 86400000))
      data.stageDayCount = days
      const stage = getCropGrowthStage(data.cropName || "Rice", days)
      data.currentStage = stage.key
    }
  }

  try {
    const updatedFarmer = await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)

      await prisma.cropField.updateMany({
        where: { id, farmerId: farmer.id },
        data,
      })

      return prisma.farmer.findUniqueOrThrow({
        where: { id: farmer.id },
        include: {
          activeCrops: { orderBy: { createdAt: "asc" } },
          _count: { select: { scans: true, savedTips: true } },
        },
      })
    }, "updateCropField")

    cacheFallbackFarmer(updatedFarmer)
    return res.json({
      success: true,
      profile: formatProfileDTO(updatedFarmer),
    })
  } catch (err: any) {
    console.warn("⚠️ [Update CropField Fallback]:", err?.message || err)
    const fb = getOrCreateFallbackFarmer(mobile)
    const idx = fb.activeCrops.findIndex((f: any) => f.id === id)
    if (idx >= 0) {
      fb.activeCrops[idx] = { ...fb.activeCrops[idx], ...data }
    }
    cacheFallbackFarmer(fb)
    return res.json({
      success: true,
      profile: formatProfileDTO(fb),
    })
  }
}

/**
 * DELETE /api/profile/fields/:id?mobile=...
 */
export async function deleteCropField(req: Request, res: Response) {
  const { id } = req.params
  const mobile = cleanMobile(req.query.mobile || req.body?.mobile)

  try {
    const updatedFarmer = await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)
      const count = await prisma.cropField.count({ where: { farmerId: farmer.id } })
      if (count <= 1) {
        throw new Error("MIN_ONE_FIELD")
      }

      await prisma.cropField.deleteMany({
        where: { id, farmerId: farmer.id },
      })

      return prisma.farmer.findUniqueOrThrow({
        where: { id: farmer.id },
        include: {
          activeCrops: { orderBy: { createdAt: "asc" } },
          _count: { select: { scans: true, savedTips: true } },
        },
      })
    }, "deleteCropField")

    cacheFallbackFarmer(updatedFarmer)
    return res.json({
      success: true,
      profile: formatProfileDTO(updatedFarmer),
    })
  } catch (err: any) {
    if (err?.message === "MIN_ONE_FIELD") {
      return res.status(400).json({
        success: false,
        error: "At least one crop plot must remain on your farm.",
      })
    }
    console.warn("⚠️ [Delete CropField Fallback]:", err?.message || err)
    const fb = getOrCreateFallbackFarmer(mobile)
    if ((fb.activeCrops || []).length <= 1) {
      return res.status(400).json({
        success: false,
        error: "At least one crop plot must remain on your farm.",
      })
    }
    fb.activeCrops = fb.activeCrops.filter((f: any) => f.id !== id)
    cacheFallbackFarmer(fb)
    return res.json({
      success: true,
      profile: formatProfileDTO(fb),
    })
  }
}

/**
 * GET /api/profile/saved-tips?mobile=...
 */
export async function getSavedTipsHandler(req: Request, res: Response) {
  const mobile = cleanMobile(req.query.mobile)
  try {
    const tips = await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)
      return prisma.savedTip.findMany({
        where: { farmerId: farmer.id },
        orderBy: { createdAt: "desc" },
      })
    }, "getSavedTipsHandler")

    setFallbackTips(mobile, tips)
    return res.json({
      success: true,
      tips: tips.map((t) => ({
        id: t.tipKey,
        tipKey: t.tipKey,
        categoryEn: t.categoryEn,
        categoryKn: t.categoryKn,
        titleEn: t.titleEn,
        titleKn: t.titleKn,
        bodyEn: t.bodyEn,
        bodyKn: t.bodyKn,
        isUserSaved: t.isUserSaved,
        createdAt: t.createdAt,
      })),
    })
  } catch (err: any) {
    console.warn("⚠️ [SavedTips GET Fallback]:", err?.message || err)
    const tips = getFallbackTips(mobile)
    return res.json({
      success: true,
      source: "Resilient Local Store",
      tips: tips.map((t) => ({
        id: t.tipKey,
        tipKey: t.tipKey,
        categoryEn: t.categoryEn,
        categoryKn: t.categoryKn,
        titleEn: t.titleEn,
        titleKn: t.titleKn,
        bodyEn: t.bodyEn,
        bodyKn: t.bodyKn,
        isUserSaved: t.isUserSaved,
        createdAt: t.createdAt,
      })),
    })
  }
}

/**
 * POST /api/profile/saved-tips
 */
export async function upsertSavedTipHandler(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = cleanMobile(body.mobile)
  const tipKey = String(body.tipKey || body.id || "").trim()
  if (!tipKey || !body.titleEn || !body.bodyEn) {
    return res.status(400).json({ success: false, error: "tipKey, titleEn, and bodyEn are required" })
  }

  const tipData = {
    tipKey,
    categoryEn: String(body.categoryEn || "Advisory"),
    categoryKn: String(body.categoryKn || "ಸಲಹೆ"),
    titleEn: String(body.titleEn),
    titleKn: String(body.titleKn || body.titleEn),
    bodyEn: String(body.bodyEn),
    bodyKn: String(body.bodyKn || body.bodyEn),
    isUserSaved: body.isUserSaved ?? true,
  }

  try {
    const saved = await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)
      return prisma.savedTip.upsert({
        where: {
          farmerId_tipKey: { farmerId: farmer.id, tipKey },
        },
        update: {
          categoryEn: tipData.categoryEn,
          categoryKn: tipData.categoryKn,
          titleEn: tipData.titleEn,
          titleKn: tipData.titleKn,
          bodyEn: tipData.bodyEn,
          bodyKn: tipData.bodyKn,
          isUserSaved: tipData.isUserSaved,
        },
        create: {
          farmerId: farmer.id,
          ...tipData,
        },
      })
    }, "upsertSavedTipHandler")

    const currentTips = getFallbackTips(mobile).filter((t) => t.tipKey !== tipKey)
    setFallbackTips(mobile, [{ ...tipData, createdAt: saved.createdAt }, ...currentTips])

    return res.json({
      success: true,
      tip: {
        id: saved.tipKey,
        tipKey: saved.tipKey,
        categoryEn: saved.categoryEn,
        categoryKn: saved.categoryKn,
        titleEn: saved.titleEn,
        titleKn: saved.titleKn,
        bodyEn: saved.bodyEn,
        bodyKn: saved.bodyKn,
        isUserSaved: saved.isUserSaved,
      },
    })
  } catch (err: any) {
    console.warn("⚠️ [SavedTips POST Fallback]:", err?.message || err)
    const existing = getFallbackTips(mobile).filter((t) => t.tipKey !== tipKey)
    const saved = { ...tipData, createdAt: new Date() }
    setFallbackTips(mobile, [saved, ...existing])
    return res.json({
      success: true,
      source: "Resilient Local Store",
      tip: {
        id: saved.tipKey,
        ...tipData,
      },
    })
  }
}

/**
 * DELETE /api/profile/saved-tips/:tipKey?mobile=...
 */
export async function deleteSavedTipHandler(req: Request, res: Response) {
  const tipKey = String(req.params.tipKey || "").trim()
  const mobile = cleanMobile(req.query.mobile || req.body?.mobile)
  if (!tipKey) {
    return res.status(400).json({ success: false, error: "tipKey is required" })
  }

  try {
    await withDbRetry(async () => {
      const farmer = await ensureFarmerLoaded(mobile)
      await prisma.savedTip.deleteMany({
        where: { farmerId: farmer.id, tipKey },
      })
    }, "deleteSavedTipHandler")

    setFallbackTips(
      mobile,
      getFallbackTips(mobile).filter((t) => t.tipKey !== tipKey)
    )
    return res.json({ success: true })
  } catch (err: any) {
    console.warn("⚠️ [SavedTips DELETE Fallback]:", err?.message || err)
    setFallbackTips(
      mobile,
      getFallbackTips(mobile).filter((t) => t.tipKey !== tipKey)
    )
    return res.json({ success: true, source: "Resilient Local Store" })
  }
}

/**
 * DELETE /api/profile?mobile=...
 * Permanently removes farmer account & associated data (Play Store Data Safety compliance).
 */
export async function deleteFarmerProfile(req: Request, res: Response) {
  const rawMobile = req.query.mobile || req.body?.mobile
  const digits = String(rawMobile || "").replace(/\D/g, "")
  if (digits.length < 10) {
    return res.status(400).json({ success: false, error: "Valid 10-digit mobile number is required" })
  }
  const mobile = digits.slice(-10)

  deleteFallbackFarmerAccount(mobile)

  try {
    await withDbRetry(async () => {
      await prisma.otpToken.deleteMany({ where: { mobile } })
      await prisma.farmer.deleteMany({ where: { mobile } })
    }, "deleteFarmerProfile")
    return res.json({ success: true, deletedMobile: mobile })
  } catch (err: any) {
    console.warn("⚠️ [Profile DELETE Fallback]:", err?.message || err)
    return res.json({ success: true, deletedMobile: mobile, source: "Resilient Local Store" })
  }
}
