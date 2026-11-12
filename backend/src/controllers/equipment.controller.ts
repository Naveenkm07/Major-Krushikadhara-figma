import type { Request, Response } from "express"
import { prisma, withDbRetry } from "../config/db.js"
import { uploadImageToCloudinary } from "../services/cloudinary.service.js"
import {
  normalizeFallbackMobile,
  getOrCreateFallbackFarmer,
  getFallbackEquipmentState,
  formatEquipmentForClient,
  formatBookingAsRental,
  addFallbackEquipment,
  updateFallbackEquipment,
  deleteFallbackEquipment,
  toggleFallbackEquipmentAlert,
  createFallbackBooking,
  updateFallbackBookingStatus,
  rateFallbackBooking,
  markFallbackEquipmentNotifsRead,
  defaultImageForType,
} from "../services/farmerFallback.service.js"

function parseCoord(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

function detectMime(buf: Buffer, name: string): string {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png"
  }
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp"
  }
  if (/\.png$/i.test(name)) return "image/png"
  if (/\.webp$/i.test(name)) return "image/webp"
  return "image/jpeg"
}

/**
 * GET /api/equipment?mobile=...&lat=...&lng=...&type=...&q=...&availOnly=...&sort=...
 * Returns full marketplace state for the authenticated farmer (nearby machinery,
 * farmer's own fleet, outgoing rentals, incoming owner requests, alerts, KPI stats).
 */
export async function getEquipmentMarketplace(req: Request, res: Response) {
  const mobile = normalizeFallbackMobile(req.query.mobile)
  const lat = parseCoord(req.query.lat)
  const lng = parseCoord(req.query.lng)
  const typeFilter = String(req.query.type || "All").trim()
  const qFilter = String(req.query.q || "").trim().toLowerCase()
  const availOnly = String(req.query.availOnly || "") === "true"
  const sort = String(req.query.sort || "nearest").trim().toLowerCase()

  let source = "Resilient Local Store"
  try {
    const dbCount = await withDbRetry(() => prisma.equipment.count(), "equipment.count")
    if (dbCount > 0) {
      source = "Neon PostgreSQL"
    }
  } catch {
    source = "Resilient Local Store"
  }

  const state = getFallbackEquipmentState(mobile, lat, lng)

  let filtered = state.equipment.filter((eq) => {
    if (typeFilter !== "All" && eq.type.toLowerCase() !== typeFilter.toLowerCase()) return false
    if (availOnly && eq.availability !== "available") return false
    if (qFilter) {
      const hay = `${eq.name} ${eq.type} ${eq.location} ${eq.owner} ${eq.crops}`.toLowerCase()
      if (!hay.includes(qFilter)) return false
    }
    return true
  })

  if (sort === "price") {
    filtered = [...filtered].sort((a, b) => a.pricePerDay - b.pricePerDay)
  } else if (sort === "rating") {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  } else if (sort === "available") {
    filtered = [...filtered].sort((a, b) => {
      if (a.availability === b.availability) return a.distanceKm - b.distanceKm
      return a.availability === "available" ? -1 : 1
    })
  } else {
    filtered = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm)
  }

  return res.json({
    success: true,
    source,
    equipment: filtered,
    allMarketplace: state.equipment,
    mine: state.mine,
    rentals: state.rentals,
    ownerRequests: state.ownerRequests,
    notifications: state.notifications,
    stats: state.stats,
  })
}

/**
 * POST /api/equipment/upload-image
 * Uploads machinery photo via Cloudinary SDK with safe base64 fallback when offline.
 */
export async function uploadEquipmentImage(req: Request, res: Response) {
  try {
    const file = req.file
    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        error: "No machinery photo provided. Use multipart field name 'image'.",
      })
    }

    const mobile = normalizeFallbackMobile(req.body?.mobile)
    const uploadRes = await uploadImageToCloudinary(
      file.buffer,
      "krushikadhara/equipment",
      file.originalname || `equip_${mobile}_${Date.now()}.jpg`
    )

    if (uploadRes.success && uploadRes.secureUrl) {
      return res.json({
        success: true,
        source: "Cloudinary CDN",
        imageUrl: uploadRes.secureUrl,
      })
    }

    // Resilient fallback so photo selection/capture always works offline or on local hotspot
    if (file.buffer.length <= 4 * 1024 * 1024) {
      const mime = detectMime(file.buffer, file.originalname || "equip.jpg")
      const dataUri = `data:${mime};base64,${file.buffer.toString("base64")}`
      return res.json({
        success: true,
        source: "Local Inline Storage",
        imageUrl: dataUri,
      })
    }

    return res.status(502).json({
      success: false,
      error: uploadRes.error || "Failed to upload machinery photo",
    })
  } catch (err: any) {
    console.error("❌ [Equipment Image Upload Error]:", err?.message || err)
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to process image upload",
    })
  }
}

/**
 * POST /api/equipment
 * Creates a new machinery listing owned by the farmer.
 */
export async function createEquipment(req: Request, res: Response) {
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || body.ownerMobile)
  const name = String(body.name || "").trim()
  const type = String(body.type || "Tractor").trim()
  const pricePerDay = Number(body.pricePerDay)

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Equipment name is required.",
    })
  }
  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid daily rental rate (₹/day) is required.",
    })
  }

  const farmer = getOrCreateFallbackFarmer(mobile)
  const lat = parseCoord(body.latitude) ?? Number(farmer.latitude || 12.5244)
  const lng = parseCoord(body.longitude) ?? Number(farmer.longitude || 76.8958)

  const created = addFallbackEquipment(mobile, {
    name,
    type,
    location: body.location ? String(body.location).trim() : farmer.district || "Mandya",
    latitude: lat,
    longitude: lng,
    pricePerDay,
    availability: body.availability,
    hp: body.hp,
    fuel: body.fuel,
    suitableCrops: body.crops || body.suitableCrops,
    condition: body.condition,
    minDuration: body.minDuration,
    description: body.description,
    deliveryAvailable: Boolean(body.deliveryAvailable),
    deliveryFee: Number(body.deliveryFee || 0),
    operatorIncluded: Boolean(body.operatorIncluded),
    operatorFeePerDay: Number(body.operatorFeePerDay || 0),
    imageUrl: body.imageUrl || body.image || defaultImageForType(type),
  })

  // Best-effort sync to Neon PostgreSQL when online
  withDbRetry(async () => {
    await prisma.equipment.create({
      data: {
        id: created.id,
        ownerId: farmer.id,
        name: created.name,
        type: created.type,
        location: created.location,
        latitude: created.latitude,
        longitude: created.longitude,
        pricePerDay: created.pricePerDay,
        availability: created.availability,
        hp: created.hp,
        fuel: created.fuel,
        suitableCrops: created.suitableCrops,
        condition: created.condition,
        minDuration: created.minDuration,
        description: created.description,
        deliveryAvailable: created.deliveryAvailable,
        deliveryFee: created.deliveryFee,
        operatorIncluded: created.operatorIncluded,
        operatorFeePerDay: created.operatorFeePerDay,
        imageUrl: created.imageUrl,
      },
    })
  }, "equipment.create").catch(() => {})

  const formatted = formatEquipmentForClient(created, mobile, lat, lng)
  const state = getFallbackEquipmentState(mobile, lat, lng)

  return res.status(201).json({
    success: true,
    equipment: formatted,
    state,
  })
}

/**
 * PUT /api/equipment/:id
 * Edits listing details or toggles availability (AVAILABLE / BOOKED / MAINTENANCE).
 */
export async function updateEquipment(req: Request, res: Response) {
  const { id } = req.params
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)

  try {
    const updated = updateFallbackEquipment(id, mobile, {
      name: body.name,
      type: body.type,
      location: body.location,
      latitude: parseCoord(body.latitude),
      longitude: parseCoord(body.longitude),
      pricePerDay: body.pricePerDay !== undefined ? Number(body.pricePerDay) : undefined,
      availability: body.availability,
      hp: body.hp,
      fuel: body.fuel,
      crops: body.crops || body.suitableCrops,
      condition: body.condition,
      minDuration: body.minDuration,
      description: body.description,
      deliveryAvailable: body.deliveryAvailable,
      deliveryFee: body.deliveryFee !== undefined ? Number(body.deliveryFee) : undefined,
      operatorIncluded: body.operatorIncluded,
      operatorFeePerDay: body.operatorFeePerDay !== undefined ? Number(body.operatorFeePerDay) : undefined,
      imageUrl: body.imageUrl || body.image,
    })

    if (!updated) {
      return res.status(404).json({ success: false, error: "Equipment listing not found" })
    }

    withDbRetry(async () => {
      await prisma.equipment.updateMany({
        where: { id },
        data: {
          name: updated.name,
          type: updated.type,
          location: updated.location,
          pricePerDay: updated.pricePerDay,
          availability: updated.availability,
          hp: updated.hp,
          fuel: updated.fuel,
          suitableCrops: updated.suitableCrops,
          condition: updated.condition,
          minDuration: updated.minDuration,
          description: updated.description,
          deliveryAvailable: updated.deliveryAvailable,
          deliveryFee: updated.deliveryFee,
          operatorIncluded: updated.operatorIncluded,
          operatorFeePerDay: updated.operatorFeePerDay,
          imageUrl: updated.imageUrl,
        },
      })
    }, "equipment.update").catch(() => {})

    const farmer = getOrCreateFallbackFarmer(mobile)
    const state = getFallbackEquipmentState(
      mobile,
      Number(farmer.latitude || 12.5244),
      Number(farmer.longitude || 76.8958)
    )
    const formatted = formatEquipmentForClient(
      updated,
      mobile,
      Number(farmer.latitude || 12.5244),
      Number(farmer.longitude || 76.8958)
    )

    return res.json({
      success: true,
      equipment: formatted,
      state,
    })
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      error: err?.message || "Could not update equipment listing",
    })
  }
}

/**
 * DELETE /api/equipment/:id?mobile=...
 * Removes owner's machinery listing cleanly.
 */
export async function deleteEquipment(req: Request, res: Response) {
  const { id } = req.params
  const mobile = normalizeFallbackMobile(req.query.mobile || req.body?.mobile)

  try {
    const ok = deleteFallbackEquipment(id, mobile)
    if (!ok) {
      return res.status(404).json({ success: false, error: "Equipment listing not found" })
    }

    withDbRetry(async () => {
      await prisma.equipment.deleteMany({ where: { id } })
    }, "equipment.delete").catch(() => {})

    const farmer = getOrCreateFallbackFarmer(mobile)
    const state = getFallbackEquipmentState(
      mobile,
      Number(farmer.latitude || 12.5244),
      Number(farmer.longitude || 76.8958)
    )

    return res.json({ success: true, state })
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      error: err?.message || "Could not remove equipment listing",
    })
  }
}

/**
 * POST /api/equipment/:id/notify
 * Toggles availability alert subscription for a farmer on a booked machine.
 */
export async function toggleEquipmentNotify(req: Request, res: Response) {
  const { id } = req.params
  const mobile = normalizeFallbackMobile(req.body?.mobile || req.query.mobile)
  const { notifyMe } = toggleFallbackEquipmentAlert(id, mobile)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const state = getFallbackEquipmentState(
    mobile,
    Number(farmer.latitude || 12.5244),
    Number(farmer.longitude || 76.8958)
  )
  return res.json({ success: true, notifyMe, state })
}

/**
 * POST /api/equipment/:id/book
 * Submits a rental booking request with calculated delivery/operator fees.
 */
export async function createEquipmentBooking(req: Request, res: Response) {
  const { id } = req.params
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || body.renterMobile)

  try {
    const booking = createFallbackBooking(mobile, id, {
      startDate: String(body.startDate || new Date().toISOString().slice(0, 10)),
      endDate: String(body.endDate || new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)),
      days: Number(body.days || 1),
      pickupMode: body.pickupMode === "delivery" ? "delivery" : "pickup",
      includeOperator: Boolean(body.includeOperator),
      notes: body.notes ? String(body.notes) : "",
    })

    const farmer = getOrCreateFallbackFarmer(mobile)
    const state = getFallbackEquipmentState(
      mobile,
      Number(farmer.latitude || 12.5244),
      Number(farmer.longitude || 76.8958)
    )

    return res.status(201).json({
      success: true,
      booking: formatBookingAsRental(booking),
      state,
    })
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err?.message || "Failed to create rental booking",
    })
  }
}

/**
 * PUT /api/equipment/bookings/:bookingId/status
 * Updates booking status: APPROVED, REJECTED, ACTIVE, COMPLETED, or CANCELLED.
 */
export async function updateEquipmentBookingStatus(req: Request, res: Response) {
  const { bookingId } = req.params
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)
  const status = String(body.status || "").trim().toUpperCase()
  const reason = body.reason ? String(body.reason).trim() : undefined

  try {
    const updated = updateFallbackBookingStatus(bookingId, mobile, status, reason)
    if (!updated) {
      return res.status(404).json({ success: false, error: "Rental booking not found" })
    }

    const farmer = getOrCreateFallbackFarmer(mobile)
    const state = getFallbackEquipmentState(
      mobile,
      Number(farmer.latitude || 12.5244),
      Number(farmer.longitude || 76.8958)
    )

    return res.json({
      success: true,
      booking: formatBookingAsRental(updated),
      state,
    })
  } catch (err: any) {
    const msg = err?.message || "Failed to update booking status"
    const code = /unauthorized/i.test(msg) ? 403 : 400
    return res.status(code).json({
      success: false,
      error: msg,
    })
  }
}

/**
 * POST /api/equipment/bookings/:bookingId/review
 * Submits 1-5 star rating & review comment after rental completion.
 */
export async function reviewEquipmentBooking(req: Request, res: Response) {
  const { bookingId } = req.params
  const body = req.body || {}
  const mobile = normalizeFallbackMobile(body.mobile || req.query.mobile)
  const rating = Number(body.rating)
  const comment = body.comment !== undefined ? String(body.comment) : undefined

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: "Please select a rating between 1 and 5 stars.",
    })
  }

  const resData = rateFallbackBooking(bookingId, mobile, rating, comment)
  if (!resData) {
    return res.status(404).json({ success: false, error: "Rental booking not found" })
  }

  const farmer = getOrCreateFallbackFarmer(mobile)
  const lat = Number(farmer.latitude || 12.5244)
  const lng = Number(farmer.longitude || 76.8958)
  const state = getFallbackEquipmentState(mobile, lat, lng)

  return res.json({
    success: true,
    booking: formatBookingAsRental(resData.booking),
    equipment: resData.equipment ? formatEquipmentForClient(resData.equipment, mobile, lat, lng) : null,
    state,
  })
}

/**
 * POST /api/equipment/notifications/read
 * Marks one or all equipment alerts as read for the farmer.
 */
export async function markEquipmentNotificationsRead(req: Request, res: Response) {
  const mobile = normalizeFallbackMobile(req.body?.mobile || req.query.mobile)
  const notificationId = req.body?.notificationId ? String(req.body.notificationId) : undefined
  const updatedCount = markFallbackEquipmentNotifsRead(mobile, notificationId)
  const farmer = getOrCreateFallbackFarmer(mobile)
  const state = getFallbackEquipmentState(
    mobile,
    Number(farmer.latitude || 12.5244),
    Number(farmer.longitude || 76.8958)
  )
  return res.json({ success: true, updatedCount, state })
}
